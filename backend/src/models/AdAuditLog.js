import mongoose from 'mongoose';

/**
 * One entry per change to the advertisement settings. The project has no
 * general-purpose audit log yet, so this is scoped to ad settings only rather
 * than standing up a shared system this feature doesn't need.
 *
 * developerName/developerUsername are snapshotted at write time so the trail
 * still reads correctly if the account is later renamed or removed, the same
 * reasoning Submission/Progress already apply to student names elsewhere.
 */
const AdAuditLogSchema = new mongoose.Schema(
  {
    developer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    developerName: { type: String, default: 'Unknown' },
    developerUsername: { type: String, default: 'unknown' },
    previous: {
      adsEnabled: Boolean,
      adFrequency: String,
      cooldownSeconds: Number,
    },
    next: {
      adsEnabled: Boolean,
      adFrequency: String,
      cooldownSeconds: Number,
    },
  },
  { timestamps: true }
);

const AdAuditLog = mongoose.model('AdAuditLog', AdAuditLogSchema);

export default AdAuditLog;
