import mongoose from "mongoose";

const ProgressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        moduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Module',
            required: true
        },
        completedSections: {
            home: {
                type: Boolean,
                default: false
            },
            learningCompetencies: {
                type: Boolean,
                default: false
            },
            lesson: {
                type: Boolean,
                default: false
            },
            activities: {
                type: Boolean,
                default: false
            },
            feedback: {
                type: Boolean,
                default: false
            },
            review: {
                type: Boolean,
                default: false
            },
            progress: {
                type: Boolean,
                default: false
            },
        },
        lastVisited: {
            type: String,
            default: 'home'
        },
        attempts: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

ProgressSchema.index(
    {
        userId: 1,
        moduleId: 1
    },
    {
        unique: true
    }
);

export default mongoose.model('Progress', ProgressSchema);