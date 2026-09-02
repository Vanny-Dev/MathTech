import { getOrCreateAdSettings } from '../models/AdSettings.js';

// @desc    Get the public advertisement configuration (any authenticated user)
// @route   GET /api/ads/settings
// @access  Private
//
// Deliberately a smaller shape than the developer endpoint: no updatedBy or
// document id, since every logged-in student and teacher can read this to
// decide whether their client should render ads at all.
export const getPublicAdSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateAdSettings();
    res.json({
      adsEnabled: settings.adsEnabled,
      adFrequency: settings.adFrequency,
      cooldownSeconds: settings.cooldownSeconds,
    });
  } catch (err) {
    next(err);
  }
};
