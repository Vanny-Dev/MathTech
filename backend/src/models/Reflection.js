import mongoose from 'mongoose';

/**
 * A student's written reflection on one topic.
 *
 * One reflection per student per module — it is edited in place rather than
 * appended to, so the unique index below is what enforces "add once, edit
 * forever". Mongoose timestamps give us createdAt (first written) and
 * updatedAt (last edited), which the UI shows back to the student.
 */
const ReflectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
  },
  { timestamps: true }
);

ReflectionSchema.index({ userId: 1, moduleId: 1 }, { unique: true });

export default mongoose.model('Reflection', ReflectionSchema);
