import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema(
    {
        activityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Activity'
        },
        givenAnswer: mongoose.Schema.Types.Mixed,
        isCorrect: Boolean,
        pointsEarned: Number,
    }
);

const SubmissionSchema = new mongoose.Schema(
  {
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
    moduleId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
    answers:    [AnswerSchema],
    totalScore: { type: Number, default: 0 },
    maxScore:   { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    isPractice: { type: Boolean, default: false },
    attempt:    { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.model('Submission', SubmissionSchema);
