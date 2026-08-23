import Submission from '../models/Submission.js';
import Activity   from '../models/Activity.js';
import Progress   from '../models/Progress.js';

/**
 * Load a submission the caller is actually entitled to read.
 *
 * These three routes looked a submission up by id alone, so any signed-in
 * student could read another student's score — and from /answers and
 * /incorrect, the correct answers and explanations for the whole quiz. Ids are
 * ObjectIds, but they appear in the URL of every student's own feedback page,
 * so they are not a secret.
 *
 * Returns null when it has already answered the request.
 */
const loadOwnSubmission = async (req, res) => {
  const submission = await Submission.findById(req.params.submissionId);

  if (!submission) {
    res.status(404).json({ message: 'Submission not found' });
    return null;
  }

  const isOwner = submission.userId?.toString() === req.user._id.toString();

  // Teachers read any submission — that is what the monitor is for.
  if (!isOwner && req.user.role !== 'teacher') {
    res.status(403).json({ message: 'This submission belongs to another student' });
    return null;
  }

  return submission;
};

// @desc    Latest graded submission for a module, for the signed-in student
// @route   GET /api/feedback/latest/:moduleId
// @access  Private
//
// The score and review pages used to read the submission id out of Redux only,
// which is memory. One refresh and a student was told "No submission found"
// with no way back, so the feedback and review sections could never be marked
// done. This lets those pages recover the student's own latest attempt.
export const getLatestSubmission = async (req, res, next) => {
  try {
    const all = await Submission.find({
      userId:     req.user._id,
      moduleId:   req.params.moduleId,
      isPractice: false,
    }).sort({ attempt: 1, createdAt: 1 });

    if (all.length === 0) {
      return res.status(404).json({ message: 'No graded submission for this topic yet' });
    }

    const submission = all[all.length - 1];
    const best = all.reduce((a, b) => (b.percentage > a.percentage ? b : a));

    res.json({
      submissionId: submission._id,
      totalScore:   submission.totalScore,
      maxScore:     submission.maxScore,
      percentage:   submission.percentage,
      attempt:      submission.attempt,
      submittedAt:  submission.createdAt,

      // Everything the activity page needs to show a student where they stand
      // before deciding whether to try again.
      attempts:       all.length,
      bestPercentage: best.percentage,
      bestAttempt:    best.attempt,
      // A perfect score is what closes the topic
      locked:         best.percentage === 100,
      history: all.map((s) => ({
        attempt:     s.attempt,
        percentage:  s.percentage,
        totalScore:  s.totalScore,
        maxScore:    s.maxScore,
        submittedAt: s.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get score summary for a submission
// @route   GET /api/feedback/:submissionId
// @access  Private
export const getScore = async (req, res, next) => {
  try {
    const submission = await loadOwnSubmission(req, res);
    if (!submission) return;

    // Mark feedback section complete — same reasoning as review below
    if (submission.userId?.toString() === req.user._id.toString()) {
      await Progress.findOneAndUpdate(
        { userId: req.user._id, moduleId: submission.moduleId },
        { $set: { 'completedSections.feedback': true, lastVisited: 'feedback' } },
        { upsert: true }
      );
    }

    res.json({
      submissionId: submission._id,
      totalScore:   submission.totalScore,
      maxScore:     submission.maxScore,
      percentage:   submission.percentage,
      attempt:      submission.attempt,
      isPractice:   submission.isPractice,
      submittedAt:  submission.createdAt,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get correct answers with student's answers
// @route   GET /api/feedback/:submissionId/answers
// @access  Private
export const getCorrectAnswers = async (req, res, next) => {
  try {
    const submission = await loadOwnSubmission(req, res);
    if (!submission) return;

    const activityIds = submission.answers.map((a) => a.activityId);
    const activities  = await Activity.find({ _id: { $in: activityIds } });

    const activityMap = {};
    activities.forEach((a) => { activityMap[a._id.toString()] = a; });

    const result = submission.answers.map((ans) => {
      const activity = activityMap[ans.activityId.toString()];
      return {
        activityId:    ans.activityId,
        question:      activity?.question,
        type:          activity?.type,
        choices:       activity?.choices,
        givenAnswer:   ans.givenAnswer,
        correctAnswer: activity?.correctAnswer,
        isCorrect:     ans.isCorrect,
        pointsEarned:  ans.pointsEarned,
        explanation:   activity?.explanation,
        comic:         activity?.comic,
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// @desc    Get only incorrect answers (for Review section)
// @route   GET /api/feedback/:submissionId/incorrect
// @access  Private
export const getIncorrectAnswers = async (req, res, next) => {
  try {
    const submission = await loadOwnSubmission(req, res);
    if (!submission) return;

    const incorrectAnswers = submission.answers.filter((a) => !a.isCorrect);
    const activityIds      = incorrectAnswers.map((a) => a.activityId);
    const activities       = await Activity.find({ _id: { $in: activityIds } });

    const activityMap = {};
    activities.forEach((a) => { activityMap[a._id.toString()] = a; });

    const result = incorrectAnswers.map((ans) => {
      const activity = activityMap[ans.activityId.toString()];
      return {
        activityId:    ans.activityId,
        question:      activity?.question,
        type:          activity?.type,
        choices:       activity?.choices,
        givenAnswer:   ans.givenAnswer,
        correctAnswer: activity?.correctAnswer,
        explanation:   activity?.explanation,
        comic:         activity?.comic,
      };
    });

    // Mark review section complete — only for the student who owns it, or a
    // teacher opening the monitor would create progress rows against their own id
    if (submission.userId?.toString() === req.user._id.toString()) {
      await Progress.findOneAndUpdate(
        { userId: req.user._id, moduleId: submission.moduleId },
        { $set: { 'completedSections.review': true, lastVisited: 'review' } },
        { upsert: true }
      );
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
};
