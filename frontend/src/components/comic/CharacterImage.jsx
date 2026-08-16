import React, { useState } from 'react';

/**
 * A comic character portrait that degrades gracefully.
 *
 * The artwork in /assets/characters/ may not exist yet. A missing file does NOT
 * return 404 — the dev server and the Vercel SPA rewrite both answer with
 * index.html, so the <img> receives HTML, fails to decode, and the browser
 * shows a broken-image icon. We catch that and draw a labelled placeholder
 * instead, which upgrades to the real art automatically once the PNG is added.
 */
export default function CharacterImage({ src, name = '', height = 140 }) {
  const [failed, setFailed] = useState(false);

  // 'dark_happy' -> 'D' / 'Miguel' -> 'M'
  const initial = (name || 'ï¿½').trim().charAt(0).toUpperCase();
  const isLight = /^light/i.test(name);

  if (!src || failed) {
    return (
      <div
        title={name ? `${name} (artwork not added yet)` : 'artwork not added yet'}
        style={{
          height: `${height}px`,
          width: `${Math.round(height * 0.62)}px`,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.3rem',
          background: isLight ? 'var(--yellow-soft)' : 'var(--board)',
          color: isLight ? 'var(--ink)' : 'var(--teal)',
          border: '3px solid var(--ink)',
          boxShadow: '3px 3px 0 var(--ink)',
        }}
      >
        <span style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1.8rem', lineHeight: 1 }}>
          {initial}
        </span>
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.52rem',
            opacity: 0.75,
            textAlign: 'center',
            padding: '0 0.2rem',
            wordBreak: 'break-word',
          }}
        >
          {name || 'character'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name || 'character'}
      onError={() => setFailed(true)}
      style={{ height: `${height}px`, objectFit: 'contain', flexShrink: 0 }}
    />
  );
}
