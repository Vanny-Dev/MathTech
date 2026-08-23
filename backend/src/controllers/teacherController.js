import User       from '../models/User.js';
import Progress   from '../models/Progress.js';
import Submission from '../models/Submission.js';
import Reflection from '../models/Reflection.js';
import {
  REQUIRED_SECTIONS,
  ALL_SECTIONS,
  countRequired,
  countAll,
  activityStatusOf,
} from '../utils/completion.js';

/**
 * Per-student graded record for one module: how many attempts, the latest, and
 * the best. Built once and shared by the monitor and the class summary so the
 * two can never disagree.
 */
const gradedStatsByStudent = (submissions) => {
  const stats = {};
  submissions.forEach((s) => {
    if (!s.userId) return;   // owner deleted; skip the orphan
    const id = s.userId._id ? s.userId._id.toString() : s.userId.toString();
    const row = stats[id] || (stats[id] = { attempts: 0, latest: null, best: null });
    row.attempts += 1;
    if (!row.latest || s.attempt > row.latest.attempt) row.latest = s;
    if (!row.best || s.percentage > row.best.percentage) row.best = s;
  });
  return stats;
};

// @desc    Get all students
// @route   GET /api/teacher/students
// @access  Private (Teacher only)
export const getAllStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json(students);
  } catch (err) {
    next(err);
  }
};

// @desc    Get all students progress on a specific module
// @route   GET /api/teacher/monitor/:moduleId
// @access  Private (Teacher only)
export const getModuleProgress = async (req, res, next) => {
  try {
    const { moduleId } = req.params;

    // Get all students
    const students = await User.find({ role: 'student' }).select('-password');

    // Get all progress docs for this module
    const progressList = await Progress.find({ moduleId }).populate(
      'userId',
      'fullname username email'
    );

    // Get all submissions for this module (non-practice only)
    const submissions = await Submission.find({ moduleId, isPractice: false })
      .populate('userId', 'fullname username');

    // populate() yields null when the owning user no longer exists, so the
    // helper skips orphaned records rather than crashing the whole monitor.
    const statsMap = gradedStatsByStudent(submissions);

    // Build a map: userId -> progress
    const progressMap = {};
    progressList.forEach((p) => {
      if (!p.userId) return;
      progressMap[p.userId._id.toString()] = p;
    });

    // Merge into one response per student
    const result = students.map((student) => {
      const sid      = student._id.toString();
      const progress = progressMap[sid] || null;
      const stats    = statsMap[sid] || null;

      // Sections are reported as detail; the status comes from the activity.
      const completedCount = countRequired(progress);

      return {
        student: {
          _id:      student._id,
          fullname: student.fullname,
          username: student.username,
          email:    student.email,
        },
        completedSections:  progress?.completedSections || {},
        completedCount,                          // out of requiredTotal
        requiredTotal:      REQUIRED_SECTIONS.length,
        sectionsTouched:    countAll(progress),
        totalSections:      ALL_SECTIONS.length,
        lastVisited:        progress?.lastVisited || 'not started',

        // Counted from real submissions rather than the progress counter, so a
        // reset or an interrupted submit cannot make the two disagree.
        attempts:           stats?.attempts || 0,
        latestScore:        stats?.latest?.percentage ?? null,
        bestScore:          stats?.best?.percentage ?? null,
        latestSubmissionAt: stats?.latest?.createdAt || null,

        status: activityStatusOf({
          attempts:       stats?.attempts || 0,
          bestPercentage: stats?.best?.percentage ?? null,
        }),
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// @desc    Get one student's full detail on a module
// @route   GET /api/teacher/monitor/:moduleId/student/:studentId
// @access  Private (Teacher only)
export const getStudentDetail = async (req, res, next) => {
  try {
    const { moduleId, studentId } = req.params;

    const student = await User.findById(studentId).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const progress = await Progress.findOne({ userId: studentId, moduleId });

    const submissions = await Submission.find({
      userId:    studentId,
      moduleId,
      isPractice: false,
    }).sort({ attempt: 1 });

    // The student's written reflection on this topic, if they have one
    const reflection = await Reflection.findOne({ userId: studentId, moduleId });

    res.json({
      student: {
        _id:      student._id,
        fullname: student.fullname,
        username: student.username,
        email:    student.email,
      },
      progress: progress || null,
      reflection: reflection
        ? {
            content:   reflection.content,
            createdAt: reflection.createdAt,
            updatedAt: reflection.updatedAt,
          }
        : null,
      submissions: submissions.map((s) => ({
        submissionId: s._id,
        attempt:      s.attempt,
        totalScore:   s.totalScore,
        maxScore:     s.maxScore,
        percentage:   s.percentage,
        submittedAt:  s.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get overall class summary for a module
// @route   GET /api/teacher/monitor/:moduleId/summary
// @access  Private (Teacher only)
export const getClassSummary = async (req, res, next) => {
  try {
    const { moduleId } = req.params;

    // Counted over the students themselves, not over progress rows.
    //
    // "Not started" used to be totalStudents minus the number of progress
    // documents for the module — but those documents are created for whoever
    // opens the page, a teacher previewing the student view included. One such
    // row was enough to push the count past the number of students and show a
    // negative "Not Started" on the dashboard. Deriving every figure from the
    // student list keeps them consistent with the cards and non-negative.
    const students    = await User.find({ role: 'student' }).select('_id');
    const studentIds  = students.map((s) => s._id);
    const submissions = await Submission.find({
      moduleId,
      isPractice: false,
      userId: { $in: studentIds },
    });

    const statsMap = gradedStatsByStudent(submissions);

    let completed  = 0;
    let inProgress = 0;
    let notStarted = 0;

    students.forEach((s) => {
      const stats = statsMap[s._id.toString()];
      const status = activityStatusOf({
        attempts:       stats?.attempts || 0,
        bestPercentage: stats?.best?.percentage ?? null,
      });
      if (status === 'completed') completed += 1;
      else if (status === 'in_progress') inProgress += 1;
      else notStarted += 1;
    });

    const totalStudents = students.length;
    const started       = completed + inProgress;

    const scores      = submissions.map((s) => s.percentage);
    const avgScore    = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    const highestScore = scores.length ? Math.max(...scores) : 0;
    const lowestScore  = scores.length ? Math.min(...scores) : 0;

    res.json({
      totalStudents,
      started,
      notStarted,
      completed,
      inProgress,
      scores: {
        average: avgScore,
        highest: highestScore,
        lowest:  lowestScore,
        total:   scores.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete one or more student accounts, with everything they own
// @route   POST /api/teacher/students/delete   body: { studentIds: [...] }
// @access  Private (Teacher only)
export const deleteStudents = async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body?.studentIds) ? req.body.studentIds : [];

    if (ids.length === 0) {
      return res.status(400).json({ message: 'No students selected' });
    }

    // Only ever delete students. A teacher must not be able to delete
    // themselves or another teacher through this endpoint, even if a
    // teacher id is passed in by hand.
    const targets = await User.find({ _id: { $in: ids }, role: 'student' }).select('_id fullname');

    if (targets.length === 0) {
      return res.status(404).json({ message: 'No matching student accounts found' });
    }

    const targetIds = targets.map((t) => t._id);

    // Remove owned records FIRST. Leaving them behind orphans documents whose
    // populated userId resolves to null, which breaks the teacher monitor for
    // every other student too.
    const [subs, progs, refls] = await Promise.all([
      Submission.deleteMany({ userId: { $in: targetIds } }),
      Progress.deleteMany({ userId: { $in: targetIds } }),
      Reflection.deleteMany({ userId: { $in: targetIds } }),
    ]);

    const { deletedCount } = await User.deleteMany({ _id: { $in: targetIds }, role: 'student' });

    res.json({
      message: `Deleted ${deletedCount} student${deletedCount === 1 ? '' : 's'}`,
      deleted: deletedCount,
      deletedNames: targets.map((t) => t.fullname),
      alsoRemoved: {
        submissions: subs.deletedCount,
        progress:    progs.deletedCount,
        reflections: refls.deletedCount,
      },
      // ids the caller asked for that were not students (or did not exist)
      skipped: ids.length - targets.length,
    });
  } catch (err) {
    next(err);
  }
};
