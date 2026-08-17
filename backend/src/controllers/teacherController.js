import User       from '../models/User.js';
import Progress   from '../models/Progress.js';
import Submission from '../models/Submission.js';
import Reflection from '../models/Reflection.js';

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

      const completedCount = progress
        ? Object.values(progress.completedSections).filter(Boolean).length
        : 0;

      return {
        student: {
          _id:      student._id,
          fullname: student.fullname,
          username: student.username,
          email:    student.email,
        },
        completedSections:  progress?.completedSections || {},
        completedCount,                          // out of 7
        lastVisited:        progress?.lastVisited || 'not started',
        attempts:           progress?.attempts || 0,
        latestScore:        submission?.percentage || null,
        latestSubmissionAt: submission?.createdAt || null,
        status: !progress
          ? 'not_started'
          : completedCount === 7
          ? 'completed'
          : 'in_progress',
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
    const completed = progressList.filter(
      (p) => Object.values(p.completedSections).every(Boolean)
    ).length;

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
