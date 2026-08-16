import mongoose from 'mongoose';

const ExampleSchema = new mongoose.Schema(
    {
        title: String,
        content: String,
        image: String,
    }
);

const ModuleSchema = new mongoose.Schema(
    {
        title: { 
            type: String,
            required: true,
        },
        subject: {
            type: String,
            default: 'General Mathematics'
        },
        gradeLevel: {
            type: String,
        },
        quarter: {
            type: String,
        },

        objectives: [String],
        competencies: [String],

        discussion: {
            type: String,
        },

        concepts: [String],
        examples: [ExampleSchema],

        developer: {
            type: String,
        },
        references: [String],

        isPublished: {
            type: Boolean,
            default: false,
        },

        // When students may open this topic.
        // null  -> available as soon as it is published
        // future date -> visible to students but locked until then
        releaseDate: {
            type: Date,
            default: null,
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Module', ModuleSchema);

    