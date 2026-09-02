// Centralized AdSense configuration. Nothing else in the app should read
// import.meta.env.VITE_ADSENSE_* or hardcode a publisher/slot id directly —
// they all go through this file so there is one place to update before
// launch and one place a developer can see every placement at a glance.

// VITE_* is baked in at BUILD time (see axiosInstance.js for the same note),
// so changing this in a hosting dashboard requires a redeploy.
const buildTimeEnabled = String(import.meta.env.VITE_ADS_ENABLED).toLowerCase() === 'true';

export const adsConfig = {
  // Build-level kill switch. false in local dev keeps real ad requests from
  // ever leaving localhost. The Developer Dashboard's ON/OFF toggle is a
  // separate, runtime switch layered on top of this one (see useAds.js) —
  // either one being off means no ads render.
  buildEnabled: buildTimeEnabled,

  clientId: import.meta.env.VITE_ADSENSE_CLIENT_ID || '',

  // Replace these placeholder ad-unit IDs with the real ones from your
  // AdSense account (Ads > By ad unit) before going live. Until then
  // AdContainer renders nothing for a slot rather than requesting a bad id.
  slots: {
    header: 'HEADER_AD_SLOT',
    content: 'CONTENT_AD_SLOT',
    sidebar: 'SIDEBAR_AD_SLOT',
    betweenContent: 'BETWEEN_CONTENT_AD_SLOT',
    footer: 'FOOTER_AD_SLOT',
  },

  // Used only when the server can't be reached — see useAds.js's fallback.
  defaultCooldownSeconds: 90,
};

export const isPlaceholderSlot = (slotId) => !slotId || /_AD_SLOT$/.test(slotId);
