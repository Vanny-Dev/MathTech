import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import { getAdSettingsApi } from '../api/adsApi.js';
import { adsConfig } from '../config/adsense.js';
import { loadAdsenseScript } from '../services/adsenseService.js';

const AdsContext = createContext(null);

const COOLDOWN_KEY_PREFIX = 'mt_ad_cooldown_';
// How long an "eligible action" (finishing a quiz, an activity, a lesson)
// stays available as an ad opportunity. Short on purpose — this must read as
// "a break point just happened", not a standing license to show an ad
// whenever one is next requested.
const ELIGIBLE_ACTION_WINDOW_MS = 15000;
const MIN_COOLDOWN_MS = 5000;

// Frequency only ever shortens the cooldown between ad opportunities — it
// never removes the cooldown, and it never invents new triggers beyond
// placements and (in every_action mode) eligible actions. See section 9 of
// the AdSense integration spec this implements.
const FREQUENCY_MULTIPLIER = { normal: 1, frequent: 0.5, every_action: 0.25 };

// Used only when /api/ads/settings can't be reached — deliberately the same
// non-aggressive values as production, never something that shows more ads
// on failure than on success.
const SAFE_DEFAULTS = {
  adsEnabled: true,
  adFrequency: 'normal',
  cooldownSeconds: adsConfig.defaultCooldownSeconds,
};

export const AdsProvider = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(SAFE_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [scriptReady, setScriptReady] = useState(false);
  const [lastEligibleActionAt, setLastEligibleActionAt] = useState(0);

  // Only students ever see an ad placement (MainLayout excludes teacher and
  // developer pages) — fetching settings and loading the AdSense script for
  // the other two roles would be pure waste.
  const canShowAdsForRole = user?.role === 'student';

  // Settings are shared app-wide config, not per-page data, so they're loaded
  // once here rather than by every component that wants to know if ads are on.
  useEffect(() => {
    if (!user?.token || !canShowAdsForRole) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    getAdSettingsApi()
      .then(({ data }) => {
        if (!cancelled && data) setSettings(data);
      })
      .catch(() => {
        // Server unreachable or ads not configured yet — keep SAFE_DEFAULTS
        // rather than surfacing an error to a student who isn't the audience
        // for this failure.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.token, canShowAdsForRole]);

  const adsEnabled = canShowAdsForRole && settings.adsEnabled && adsConfig.buildEnabled;

  // The AdSense script itself is only ever requested once ads are actually
  // supposed to run for this user — never speculatively on app start.
  useEffect(() => {
    if (!user?.token || !adsEnabled) return;
    let cancelled = false;
    loadAdsenseScript().then((result) => {
      if (!cancelled) setScriptReady(result.ok);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.token, adsEnabled]);

  const effectiveCooldownMs = Math.max(
    MIN_COOLDOWN_MS,
    settings.cooldownSeconds * 1000 * (FREQUENCY_MULTIPLIER[settings.adFrequency] ?? 1)
  );

  const canRequestAd = useCallback(
    (placementId) => {
      if (!adsEnabled || !scriptReady) return false;
      let last = 0;
      try {
        last = Number(localStorage.getItem(COOLDOWN_KEY_PREFIX + placementId) || 0);
      } catch {
        // Private browsing / storage disabled — treat as "never shown before"
      }
      return Date.now() - last >= effectiveCooldownMs;
    },
    [adsEnabled, scriptReady, effectiveCooldownMs]
  );

  const markAdRequested = useCallback((placementId) => {
    try {
      localStorage.setItem(COOLDOWN_KEY_PREFIX + placementId, String(Date.now()));
    } catch {
      // Nothing to fall back to — worst case this placement's cooldown
      // isn't remembered across reloads, which is not worth failing over.
    }
  }, []);

  // Only meaningful in EVERY_ELIGIBLE_ACTION mode — see AdContainer's
  // `trigger="eligible-action"` handling. In normal/frequent mode this is
  // intentionally a no-op, so calling it from a page never has to check the
  // current frequency mode first.
  const notifyEligibleAction = useCallback(
    (actionName) => {
      if (settings.adFrequency !== 'every_action') return;
      setLastEligibleActionAt(Date.now());
      if (import.meta.env.DEV) console.info(`[ads] eligible action: ${actionName}`);
    },
    [settings.adFrequency]
  );

  const hasRecentEligibleAction = () =>
    lastEligibleActionAt > 0 && Date.now() - lastEligibleActionAt < ELIGIBLE_ACTION_WINDOW_MS;

  const value = {
    loading,
    adsEnabled,
    adFrequency: settings.adFrequency,
    cooldownSeconds: settings.cooldownSeconds,
    scriptReady,
    canRequestAd,
    markAdRequested,
    notifyEligibleAction,
    hasRecentEligibleAction,
  };

  return <AdsContext.Provider value={value}>{children}</AdsContext.Provider>;
};

export const useAdsContext = () => useContext(AdsContext);
