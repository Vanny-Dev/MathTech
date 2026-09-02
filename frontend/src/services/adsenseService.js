import { adsConfig } from '../config/adsense.js';

// Module-level, not component state: the script must be requested at most
// once per page load no matter how many AdsenseAd components mount/unmount
// as the user navigates this single-page app. A second <script> tag or a
// second adsbygoogle.js load is exactly the kind of duplicate-request
// behavior AdSense policy warns about.
let scriptState = 'idle'; // 'idle' | 'loading' | 'ready' | 'error'
let scriptPromise = null;

const SCRIPT_SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

/**
 * Loads the AdSense script exactly once and resolves once it's ready to
 * accept (adsbygoogle = window.adsbygoogle || []).push({}) calls.
 *
 * Never throws — ad blockers, network failures, and missing configuration
 * are all reported as a resolved { ok: false } rather than a rejection, so a
 * caller never needs a try/catch just to render the rest of the page.
 */
export const loadAdsenseScript = () => {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve) => {
    if (!adsConfig.buildEnabled) {
      scriptState = 'error';
      resolve({ ok: false, reason: 'ads_disabled_by_build' });
      return;
    }

    if (!adsConfig.clientId || adsConfig.clientId.includes('XXXXXXXX')) {
      scriptState = 'error';
      resolve({ ok: false, reason: 'missing_client_id' });
      return;
    }

    scriptState = 'loading';

    const script = document.createElement('script');
    script.async = true;
    script.src = `${SCRIPT_SRC}?client=${encodeURIComponent(adsConfig.clientId)}`;
    script.crossOrigin = 'anonymous';

    script.onload = () => {
      scriptState = 'ready';
      resolve({ ok: true });
    };

    // A blocked request (ad blocker, offline, network error) fires `onerror`
    // rather than rejecting a promise anywhere — this is the only place that
    // needs to catch it.
    script.onerror = () => {
      scriptState = 'error';
      resolve({ ok: false, reason: 'script_load_failed' });
    };

    document.head.appendChild(script);
  });

  return scriptPromise;
};

export const getAdsenseScriptState = () => scriptState;

/**
 * Requests one ad fill for an already-rendered <ins class="adsbygoogle">
 * element. Swallows the error adsbygoogle.js throws when it's asked to fill
 * an element that isn't in the DOM yet or was already filled — both are
 * routine in a component that can re-render, not application bugs.
 */
export const pushAd = () => {
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
    return true;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[adsenseService] pushAd failed:', err);
    }
    return false;
  }
};
