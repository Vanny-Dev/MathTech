import Activity from '../models/Activity.js';
import Submission from '../models/Submission.js';
import Progress from '../models/Progress.js';
import Module from '../models/Module.js';
import { denyIfLocked } from '../utils/release.js';

// @desc    Get all activities for a specific module
// @route   GET /api/activities?moduleId=&isPractice=
// @access  Private

export const getActivities = async (req, res, next) => {
    try {
        const { moduleId, isPractice } = req.query;

        if (!moduleId) {
            return res.status(400).json({ message: 'moduleId query parameter is required' });
        }

        // Quiz items must not leak before the topic is released
        const module = await Module.findById(moduleId).select('isPublished releaseDate title');
        if (denyIfLocked(res, req.user, module)) return;

        const filter = { moduleId };
        if (isPractice !== undefined) {
            filter.isPractice = isPractice === 'true'; // Convert string to boolean
        }

        const activities = await Activity.find(filter)
            .sort({ order: 1 }) // Sort by order in ascending order
            .select('-correctAnswer -explanation'); // Exclude the correctAnswer and explanation fields
        res.json(activities);
    } catch (err) {
        next(err);
    }
};

// @desc    Submit answers for grading
// @route   POST /api/activities/submit
// @access  Private

export const submitAnswers = async (req, res, next) => {
    try {
        const { moduleId, answers, isPractice } = req.body;
        // answers: [{ activityId, givenAnswer }]

        if (!moduleId) {
            return res.status(400).json({ message: 'moduleId is required' });
        }
        if (!Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ message: 'answers must be a non-empty array' });
        }

        // A locked topic cannot be answered, even by posting straight to the API
        const module = await Module.findById(moduleId).select('isPublished releaseDate title');
        if (denyIfLocked(res, req.user, module)) return;

        const activityIds = answers.map(a => a.activityId);
        const activities = await Activity.find({ _id: { $in: activityIds } });

        const activityMap = {};
        activities.forEach((a) => {
            activityMap[a._id.toString()] = a;
        });

        let totalScore = 0;
        let maxScore = 0;

        const gradedAnswers = answers.map((answer) => {
            const activity = activityMap[answer.activityId];

            if (!activity) return null; // Skip if activity not found

            maxScore += activity.points;

            const correct = checkAnswer(activity, answer.givenAnswer);
            const pointsEarned = correct ? activity.points : 0;
            totalScore += pointsEarned;

            return {
                activityId: activity._id,
                givenAnswer: answer.givenAnswer,
                isCorrect: correct,
                pointsEarned,
            };
        }).filter(Boolean); // Remove nulls

        if (gradedAnswers.length === 0) {
            return res.status(400).json({ message: 'No valid activities found for the given answers' });
        }

        const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

        // Attempt number = how many submissions this user already has for this module
        const prevAttempts = await Submission.countDocuments({
            userId: req.user._id,
            moduleId,
            isPractice: isPractice || false,
        });

        const submission = await Submission.create({
            userId: req.user._id,
            moduleId,
            answers: gradedAnswers,
            totalScore,
            maxScore,
            percentage,
            isPractice: isPractice || false,
            attempt: prevAttempts + 1,
        });

        if(!isPractice) {
            await Progress.findOneAndUpdate(
                {
                    userId: req.user._id,
                    moduleId,
                },
                {
                    $set: {
                        'completedSections.activities': true,
                        lastVisited: 'feedback',
                    },
                    $inc: { attempts: 1 },
                },
                { upsert: true, new: true }
            );
        }

        res.status(201).json({
            submissionId: submission._id,
            totalScore,
            maxScore,
            percentage,
            attempt: submission.attempt,
        });
    } catch (err) {
        next(err);
    }
};

// @ desc Create an activity
// @ route POST /api/activities
// @ access Private (for teachers only)

export const createActivity = async (req, res, next) => {
    try {
        const activity = await Activity.create(req.body);
        res.status(201).json(activity);
    } catch (err) {
        next(err);
    }
};

// @desc Update an activity
// @route PUT /api/activities/:id
// @access Private (for teachers only)

export const updateActivity = async (req, res, next) => {
    try {
        const activity = await Activity.findByIdAndUpdate(req.params.id, req.body,
            { 
                new: true,
                runValidators: true,

            });

            if (!activity) return res.status(404).json({ message: 'Activity not found' });
            res.json(activity);
    } catch (err) {
        next(err);
    }
};

// @desc Delete an activity
// @route DELETE /api/activities/:id
// @access Private (for teachers only)

export const deleteActivity = async (req, res, next) => {
    try {
        const activity = await Activity.findByIdAndDelete(req.params.id);
        if (!activity) return res.status(404).json({ message: 'Activity not found' });
        res.json({ message: 'Activity deleted successfully' });
    } catch (err) {
        next(err);
    }
};

// Helper function

// Normalise a free-text value for comparison:
// trim, lowercase, drop currency symbols, thousands separators and % signs.
function normalise(value) {
    return String(value ?? '')
        .trim()
        .toLowerCase()
        .replace(/[₱$,\s]/g, '')  // peso sign, dollar, commas, whitespace
        .replace(/%$/, '');
}

// Parse a normalised value as a number, or return null when it is not numeric.
function toNumber(value) {
    const cleaned = normalise(value);
    if (cleaned === '' || !/^-?\d*\.?\d+$/.test(cleaned)) return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
}

// Math answers must compare numerically: "1,234.50", "₱1234.5" and "1234.5"
// are all the same answer. Falls back to text comparison for word answers.
function valuesMatch(given, correct) {
    const g = toNumber(given);
    const c = toNumber(correct);

    if (g !== null && c !== null) {
        // tolerance absorbs float noise and centavo rounding
        return Math.abs(g - c) < 0.005;
    }
    return normalise(given) === normalise(correct);
}

// true / false answers arrive as booleans or as strings from the UI.
function toBoolean(value) {
    const v = normalise(value);
    if (['true', 't', 'yes', '1'].includes(v)) return true;
    if (['false', 'f', 'no', '0'].includes(v)) return false;
    return null;
}

function checkAnswer(activity, givenAnswer) {
    const correct = activity.correctAnswer;

    switch (activity.type) {
        case 'multiple_choice':
        case 'fill_blank':
            return valuesMatch(givenAnswer, correct);

        case 'true_false': {
            const g = toBoolean(givenAnswer);
            const c = toBoolean(correct);
            return g !== null && c !== null && g === c;
        }

        default:
            return false;
    }
}