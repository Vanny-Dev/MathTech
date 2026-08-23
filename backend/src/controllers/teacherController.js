import User       from '../models/User.js';
import Progress   from '../models/Progress.js';
import Submission from '../models/Submission.js';
import Reflection from '../models/Reflection.js';
import {
  REQUIRED_SECTIONS,
  ALL_SECTIONS,
  countRequired,
  countAll,
  isComplete,
  statusOf,
} from '../utils/completion.js';

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

    // Build a map: userId -> latest submission.
    // populate() yields null when the owning user no longer exists, so skip
    // orphaned records rather than crashing the whole monitor.
    const submissionMap = {};
    submissions.forEach((s) => {
      if (!s.userId) return;
      const id = s.userId._id.toString();
      if (!submissionMap[id] || s.attempt > submissionMap[id].attempt) {
        submissionMap[id] = s;
      }
    });

    // Build a map: userId -> progress
    const progressMap = {};
    progressList.forEach((p) => {
      if (!p.userId) return;
      progressMap[p.userId._id.toString()] = p;
    });

    // Merge into one response per student
    const result = students.map((student) => {
      const sid        = student._id.toString();
      const progress   = progressMap[sid] || null;
      const submission = submissionMap[sid] || null;

      // Counted against the sections a student must actually work through,
      // not all seven — see utils/completion.js.
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
        attempts:           progress?.attempts || 0,
        latestScore:        submission?.percentage || null,
        latestSubmissionAt: submission?.createdAt || null,
        status: statusOf(progress),
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

    const totalStudents = await User.countDocuments({ role: 'student' });

    const progressList  = await Progress.find({ moduleId });
    const submissions   = await Submission.find({ moduleId, isPractice: false });

    const started   = progressList.length;
    const completed = progressList.filter(isComplete).length;

    const scores      = submissions.map((s) => s.percentage);
    const avgScore    = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    const highestScore = scores.length ? Math.max(...scores) : 0;
    const lowestScore  = scores.length ? Math.min(...scores) : 0;

    res.json({
      totalStudents,
      started,
      notStarted: totalStudents - started,
      completed,
      inProgress: started - completed,
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
