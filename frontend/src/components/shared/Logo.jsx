import React from 'react';
import logo from '../../assets/logo.png';

/**
 * The MathTech brand lockup.
 *
 * The artwork already contains the "MathTech" wordmark, so nothing that uses
 * this component should print the name again beside it.
 *
 * Sized by WIDTH, not height — it is a landscape lockup (3:2), so constraining
 * the height makes the wordmark too small to read.
 *
 * It lives in src/assets/ rather than public/, so it must be imported; Vite
 * then fingerprints the file and inlines the hashed URL at build time.
 */
export default function Logo({ width = 180, style }) {
  return (
    <img
      src={logo}
      alt="MathTech"
      style={{
        width: `${width}px`,
        maxWidth: '100%',
        height: 'auto',
        objectFit: 'contain',
        display: 'block',
        ...style,
      }}
    />
  );
}

export { logo as logoSrc };
