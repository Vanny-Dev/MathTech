import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAds } from '../../hooks/useAds.js';
import { adsConfig, isPlaceholderSlot } from '../../config/adsense.js';
import AdsenseAd from './AdsenseAd.jsx';

// Reserves roughly the height AdSense will fill, so an ad arriving late never
// shifts the content underneath it (Cumulative Layout Shift).
const MIN_HEIGHT_BY_FORMAT = {
  auto: 100,
  horizontal: 90,
  rectangle: 250,
  vertical: 600,
};

// Real analytics wiring (e.g. an existing events pipeline) would replace this
// — kept as a single seam so every ad lifecycle event goes through one place,
// and dev-only so it never becomes noise for a real deployment.
const trackAdEvent = (event, detail) => {
  if (import.meta.env.DEV) console.info(`[ads] ${event}`, detail);
};

/**
 * The one component pages actually use to place an ad. It is the sole
 * decision-maker for *whether* an ad renders at all:
 *
 *   - the master switch (developer ON/OFF, and the build-time kill switch)
 *   - a real ad-unit id being configured for this placement
 *   - the cooldown for this specific placement having elapsed
 *   - for `trigger="eligible-action"` placements, a recent eligible action
 *     (see useAds().notifyEligibleAction) — and only in EVERY_ELIGIBLE_ACTION
 *     mode; in normal/frequent mode this trigger type never renders, which is
 *     what stops those modes from inventing ad triggers beyond the ones
 *     placements and eligible actions define
 *
 * so every other ad component can stay unaware of settings entirely. Renders
 * nothing (not even reserved space) until eligibility is actually confirmed,
 * and nothing at all if the ad fails to load — the workbook must never look
 * broken because an ad didn't.
 */
export default function AdContainer({ placement, format = 'auto', trigger = 'always', className, style }) {
  const { adsEnabled, adFrequency, canRequestAd, markAdRequested, hasRecentEligibleAction, loading } = useAds();
  const location = useLocation();
  const [canShow, setCanShow] = useState(false);

  const slotId = adsConfig.slots[placement];

  // Re-evaluated on every route change, since a placement id is meant to be
  // reused across pages (e.g. "content") rather than carry state between them.
  useEffect(() => {
    setCanShow(false);
    if (loading || !adsEnabled) return;
    if (isPlaceholderSlot(slotId)) return; // real ad-unit id not filled in yet

    const eligible =
      trigger === 'eligible-action'
        ? adFrequency === 'every_action' && hasRecentEligibleAction()
        : true;
    if (!eligible) return;

    if (!canRequestAd(placement)) return; // still cooling down — do not request early

    markAdRequested(placement);
    trackAdEvent('opportunity', { placement, trigger, adFrequency });
    setCanShow(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, adsEnabled, slotId, trigger, adFrequency, location.pathname, placement]);

  if (!canShow) return null;

  const minHeight = MIN_HEIGHT_BY_FORMAT[format] ?? MIN_HEIGHT_BY_FORMAT.auto;

  return (
    <div
      className={className}
      style={{ minHeight, display: 'flex', justifyContent: 'center', overflow: 'hidden', ...style }}
      // Advertising content must be identifiable as such — never styled to
      // look like an application control or blended into the workbook UI.
      aria-label="Advertisement"
    >
      <AdsenseAd
        slotId={slotId}
        format={format}
        style={{ width: '100%' }}
        onFilled={() => trackAdEvent('loaded', { placement })}
        onError={(reason) => {
          trackAdEvent('load_failed', { placement, reason });
          setCanShow(false);
        }}
      />
    </div>
  );
}
