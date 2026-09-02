import React from 'react';
import AdContainer from './AdContainer.jsx';

/**
 * A fixed horizontal banner — the header/top-of-page placement, which needs a
 * predictable, modest height rather than the fuller responsive box a content
 * or footer ad can use.
 */
export default function BannerAd({ placement, className, style }) {
  return (
    <AdContainer
      placement={placement}
      format="horizontal"
      trigger="always"
      className={className}
      style={style}
    />
  );
}
