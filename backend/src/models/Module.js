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
        // null        -> LOCKED, not scheduled yet (the default for new topics)
        // future date -> visible to students but locked until then
        // past/now    -> open
        // A topic is closed by default so a restart or a newly added topic
        // never exposes content before the teacher opens it.
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

    