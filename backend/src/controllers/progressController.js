import Progress   from '../models/Progress.js';
import Submission  from '../models/Submission.js';

// @desc    Get progress for a user on a module
// @route   GET /api/progress/:moduleId
// @access  Private
export const getProgress = async (req, res, next) => {
  try {
    const progress = await Progress.findOne({
      userId:   req.user._id,
      moduleId: req.params.moduleId,
    });

    if (!progress) {
      // Return default (untouched) progress
      return res.json({
        completedSections: {
          home: false, learningCompetencies: false, lesson: false,
          activities: false, feedback: false, review: false, progress: false,
        },
        lastVisited: 'home',
        attempts: 0,
      });
    }

    res.json(progress);
  } catch (err) {
    next(err);
  }
};

// @desc    Mark a section as complete
// @route   PUT /api/progress/:moduleId/section
// @access  Private
export const markSectionComplete = async (req, res, next) => {
  try {
    const { section } = req.body;

    const validSections = [
      'home', 'learningCompetencies', 'lesson',
      'activities', 'feedback', 'review', 'progress',
    ];

    if (!validSections.includes(section)) {
      return res.status(400).json({ message: 'Invalid section name' });
    }

    const progress = await Progress.findOneAndUpdate(
      { userId: req.user._id, moduleId: req.params.moduleId },
      {
        $set: {
          [`completedSections.${section}`]: true,
          lastVisited: section,
        },
      },
      { upsert: true, new: true }
    );

    res.json(progress);
  } catch (err) {
    next(err);
  }
};

// @desc    Get performance summary (all submissions for a module)
// @route   GET /api/progress/:moduleId/summary
// @access  Private
export const getPerformanceSummary = async (req, res, next) => {
  try {
    const submissions = await Submission.find({
      userId:    req.user._id,
      moduleId:  req.params.moduleId,
      isPractice: false,
    }).sort({ createdAt: 1 });

    const summary = submissions.map((s) => ({
      attempt:     s.attempt,
      totalScore:  s.totalScore,
      maxScore:    s.maxScore,
      percentage:  s.percentage,
      submittedAt: s.createdAt,
    }));

    const best = summary.reduce(
      (max, s) => (s.percentage > max.percentage ? s : max),
      { percentage: 0 }
    );

    // Mark progress section complete
    await Progress.findOneAndUpdate(
      { userId: req.user._id, moduleId: req.params.moduleId },
      { $set: { 'completedSections.progress': true, lastVisited: 'progress' } },
      { upsert: true }
    );

    res.json({ summary, best, totalAttempts: submissions.length });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all completed activities across all modules for a user
// @route   GET /api/progress/completed
// @access  Private
export const getCompletedActivities = async (req, res, next) => {
  try {
    const submissions = await Submission.find({
      userId:    req.user._id,
      isPractice: false,
    })
      .populate('moduleId', 'title subject')
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (err) {
    next(err);
  }
};
