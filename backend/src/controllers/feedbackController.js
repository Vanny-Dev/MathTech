import Submission from '../models/Submission.js';
import Activity   from '../models/Activity.js';
import Progress   from '../models/Progress.js';

// @desc    Get score summary for a submission
// @route   GET /api/feedback/:submissionId
// @access  Private
export const getScore = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    // Mark feedback section complete
    await Progress.findOneAndUpdate(
      { userId: req.user._id, moduleId: submission.moduleId },
      { $set: { 'completedSections.feedback': true, lastVisited: 'feedback' } },
      { upsert: true }
    );

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
    const submission = await Submission.findById(req.params.submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

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
    const submission = await Submission.findById(req.params.submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

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

    // Mark review section complete
    await Progress.findOneAndUpdate(
      { userId: req.user._id, moduleId: submission.moduleId },
      { $set: { 'completedSections.review': true, lastVisited: 'review' } },
      { upsert: true }
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
};
