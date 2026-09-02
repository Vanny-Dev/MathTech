import React, { useEffect, useRef } from 'react';
import { adsConfig } from '../../config/adsense.js';
import { pushAd } from '../../services/adsenseService.js';

/**
 * The raw <ins class="adsbygoogle"> unit. This is the only component that
 * talks to adsbygoogle.js directly — everything else (AdContainer,
 * ResponsiveAd, BannerAd) composes this one so there is a single place that
 * requests a fill.
 *
 * Never rendered directly by a page; AdContainer decides *whether* an ad
 * should exist at all (master switch, frequency, cooldown) before mounting
 * this component, which only concerns itself with *how* to render one.
 */
export default function AdsenseAd({ slotId, format = 'auto', responsive = true, style, onFilled, onError }) {
  const insRef = useRef(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    // A fresh mount (new route, new placement) always gets its own push —
    // this only guards against React StrictMode's double-invoke or a
    // re-render calling it twice for the *same* element.
    if (pushedRef.current || !insRef.current) return;
    pushedRef.current = true;

    const ok = pushAd();
    if (ok) onFilled?.();
    else onError?.('push_failed');
  }, [onFilled, onError]);

  return (
    <ins
      ref={insRef}
      className="adsbygoogle"
      style={{ display: 'block', ...style }}
      data-ad-client={adsConfig.clientId}
      data-ad-slot={slotId}
      data-ad-format={format}
      data-full-width-responsive={responsive ? 'true' : 'false'}
    />
  );
}
