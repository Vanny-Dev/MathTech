import Progress   from '../models/Progress.js';
import Submission  from '../models/Submission.js';
import { REQUIRED_SECTIONS, countRequired, activityStatusOf } from '../utils/completion.js';
import { emitStatusChange } from '../realtime/index.js';

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

    // Progress belongs to students. A teacher previewing the student pages used
    // to be given a progress row of their own, and those rows were then counted
    // as "started" in the class summary — which is how Not Started went
    // negative. Let the preview work, but record nothing.
    if (req.user.role !== 'student') {
      return res.json({
        completedSections: {}, lastVisited: section, attempts: 0, preview: true,
      });
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

// @desc    Note that this student has opened the graded activity
// @route   PUT /api/progress/:moduleId/activity-started
// @access  Private
//
// Called when the activity page opens. Idempotent: the timestamp is only ever
// written once, so re-opening the page does not move it.
export const markActivityStarted = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return res.json({ preview: true });
    }

    const progress = await Progress.findOneAndUpdate(
      { userId: req.user._id, moduleId: req.params.moduleId },
      {
        $setOnInsert: { activityStartedAt: new Date() },
        $set: { lastVisited: 'activities' },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // $setOnInsert only fires when the row is created, so an existing row that
    // predates this field still needs the stamp.
    if (!progress.activityStartedAt) {
      progress.activityStartedAt = new Date();
      await progress.save();
    }

    emitStatusChange({
      studentId: req.user._id.toString(),
      moduleId:  String(req.params.moduleId),
      status:    'in_progress',
      startedAt: progress.activityStartedAt,
    });

    res.json({ activityStartedAt: progress.activityStartedAt });
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

    // Same reasoning as markSectionComplete: only a student's own progress is
    // recorded, so a teacher opening this page leaves no row behind.
    if (req.user.role === 'student') {
      await Progress.findOneAndUpdate(
        { userId: req.user._id, moduleId: req.params.moduleId },
        { $set: { 'completedSections.progress': true, lastVisited: 'progress' } },
        { upsert: true }
      );
    }

    res.json({ summary, best, totalAttempts: submissions.length });
  } catch (err) {
    next(err);
  }
};

// @desc    Where the signed-in student stands on every topic, in one call
// @route   GET /api/progress/mine
// @access  Private
//
// The topics list needs a per-topic status without asking for each module
// separately, and the activity pages need to know whether the graded set is
// already closed for this student.
export const getMyProgress = async (req, res, next) => {
  try {
    const [progressList, submissions] = await Promise.all([
      Progress.find({ userId: req.user._id }),
      Submission.find({ userId: req.user._id, isPractice: false }).sort({ attempt: -1 }),
    ]);

    // Per module: how many graded attempts, the latest, and the best
    const statsByModule = {};
    submissions.forEach((s) => {
      const id = s.moduleId.toString();
      const row = statsByModule[id] || (statsByModule[id] = { attempts: 0, latest: null, best: null });
      row.attempts += 1;
      // The list is sorted by attempt descending, so the first seen is latest
      if (!row.latest) row.latest = s;
      if (!row.best || s.percentage > row.best.percentage) row.best = s;
    });

    const byModule = {};

    const rowFor = (id, progress, stats) => ({
      moduleId:          id,
      // Same rule the teacher monitor uses: the activity decides.
      status:            activityStatusOf({
        attempts:  stats?.attempts ?? 0,
        startedAt: progress?.activityStartedAt ?? null,
      }),
      completedCount:    countRequired(progress),
      requiredTotal:     REQUIRED_SECTIONS.length,
      completedSections: progress?.completedSections ?? {},
      attempts:          stats?.attempts ?? 0,
      percentage:        stats?.latest?.percentage ?? null,
      bestPercentage:    stats?.best?.percentage ?? null,
      submittedAt:       stats?.latest?.createdAt ?? null,
      // Answering perfectly is what closes a topic; anything less stays open
      activityLocked:    stats?.best?.percentage === 100,
    });

    progressList.forEach((p) => {
      const id = p.moduleId.toString();
      byModule[id] = rowFor(id, p, statsByModule[id]);
    });

    // A submission with no progress row should still report its scores
    Object.entries(statsByModule).forEach(([id, stats]) => {
      if (byModule[id]) return;
      byModule[id] = rowFor(id, null, stats);
    });

    res.json(Object.values(byModule));
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
