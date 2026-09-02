import mongoose from 'mongoose';

/**
 * Global advertisement configuration. Deliberately a singleton: the app has
 * one ad experience to tune, not one per user, so every read/write goes
 * through getOrCreate() below instead of a query by id.
 */
const AdSettingsSchema = new mongoose.Schema(
  {
    adsEnabled: {
      type: Boolean,
      required: true,
      default: true,
    },
    adFrequency: {
      type: String,
      enum: ['normal', 'frequent', 'every_action'],
      required: true,
      default: 'normal',
    },
    cooldownSeconds: {
      type: Number,
      required: true,
      default: 90,
      min: 0,
      max: 3600,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

const AdSettings = mongoose.model('AdSettings', AdSettingsSchema);

/**
 * Fetches the single settings document, creating it with safe production
 * defaults on first use so the rest of the app never has to handle "no
 * settings yet" as a separate case.
 */
export const getOrCreateAdSettings = async () => {
  let settings = await AdSettings.findOne();
  if (!settings) {
    settings = await AdSettings.create({});
  }
  return settings;
};

export default AdSettings;
