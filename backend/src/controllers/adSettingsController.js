import { getOrCreateAdSettings } from '../models/AdSettings.js';
import AdAuditLog from '../models/AdAuditLog.js';

const FREQUENCIES = ['normal', 'frequent', 'every_action'];

// @desc    Get the current advertisement settings
// @route   GET /api/developer/ads/settings
// @access  Private (Developer only)
export const getAdSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateAdSettings();
    res.json(settings);
  } catch (err) {
    next(err);
  }
};

// @desc    Update the advertisement settings and record who changed what
// @route   PUT /api/developer/ads/settings
// @access  Private (Developer only)
export const updateAdSettings = async (req, res, next) => {
  try {
    const { adsEnabled, adFrequency, cooldownSeconds } = req.body;

    if (adFrequency !== undefined && !FREQUENCIES.includes(adFrequency)) {
      return res.status(400).json({
        message: `adFrequency must be one of: ${FREQUENCIES.join(', ')}`,
      });
    }

    if (
      cooldownSeconds !== undefined &&
      (typeof cooldownSeconds !== 'number' || cooldownSeconds < 0 || cooldownSeconds > 3600)
    ) {
      return res.status(400).json({ message: 'cooldownSeconds must be a number between 0 and 3600' });
    }

    const settings = await getOrCreateAdSettings();

    const previous = {
      adsEnabled: settings.adsEnabled,
      adFrequency: settings.adFrequency,
      cooldownSeconds: settings.cooldownSeconds,
    };

    if (adsEnabled !== undefined) settings.adsEnabled = !!adsEnabled;
    if (adFrequency !== undefined) settings.adFrequency = adFrequency;
    if (cooldownSeconds !== undefined) settings.cooldownSeconds = cooldownSeconds;
    settings.updatedBy = req.user._id;

    await settings.save();

    const next_ = {
      adsEnabled: settings.adsEnabled,
      adFrequency: settings.adFrequency,
      cooldownSeconds: settings.cooldownSeconds,
    };

    // Only worth a log entry if something actually changed.
    const changed =
      previous.adsEnabled !== next_.adsEnabled ||
      previous.adFrequency !== next_.adFrequency ||
      previous.cooldownSeconds !== next_.cooldownSeconds;

    if (changed) {
      await AdAuditLog.create({
        developer: req.user._id,
        developerName: req.user.fullname,
        developerUsername: req.user.username,
        previous,
        next: next_,
      });
    }

    res.json(settings);
  } catch (err) {
    next(err);
  }
};

// @desc    List recent advertisement-settings changes
// @route   GET /api/developer/ads/audit-log
// @access  Private (Developer only)
export const getAdAuditLog = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const entries = await AdAuditLog.find().sort({ createdAt: -1 }).limit(limit);
    res.json(entries);
  } catch (err) {
    next(err);
  }
};
