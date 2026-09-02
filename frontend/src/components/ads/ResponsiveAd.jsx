import React from 'react';
import AdContainer from './AdContainer.jsx';

/**
 * A responsive, in-content ad unit that adapts to its column width — the
 * default choice for placements inside the reading column (between-content,
 * content, footer).
 */
export default function ResponsiveAd({ placement, trigger = 'always', className, style }) {
  return (
    <AdContainer
      placement={placement}
      format="auto"
      trigger={trigger}
      className={className}
      style={style}
    />
  );
}
