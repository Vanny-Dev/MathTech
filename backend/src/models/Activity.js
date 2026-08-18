import mongoose from 'mongoose';

const ComicConfigSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            default: 'dark_idle',
        },
        thinkingCharacter: {
            type: String,
            default: 'light_thinking'
        },
        correctCharacter: {
            type: String,
            default: 'dark_happy'
        },
        wrongCharacter: {
            type: String,
            default: 'dark_serious'
        },
        panelBackground: {
            type: String,
            default: 'default'
        },
    }
);

const ActivitySchema = new mongoose.Schema(
    {
        moduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Module',
            required: true,
        },
        type: {
            type: String,
            enum: ['multiple_choice', 'fill_blank', 'true_false'],
            requred: true,
        },
        question: {
            type: String,
            required: true
        },
        choices: [String],
        correctAnswer: mongoose.Schema.Types.Mixed,
        explanation: {
            type: String
        },
        isPractice: {
            type: Boolean,
            default: false
        },
        points: {
            type: Number,
            default: 1
        },
        order: {
            type: Number,
            default: 0
        },
        comic: {
            type: ComicConfigSchema,
            default: () => ({})
        },
    },
    {
        timestamps: true
    }
);

export default mongoose.model('Activity', ActivitySchema);