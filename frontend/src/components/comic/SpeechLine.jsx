import React, { useState } from 'react';

/**
 * One line of comic dialogue: a character portrait and a speech bubble with a
 * tail pointing back at them.
 *
 * The lesson and the activities used to draw their own bubbles, which is why
 * the two drifted apart — the lesson had tailed comic bubbles while the
 * exercises had a plain rounded box. Both now render through here, so a
 * character keeps the same face, the same side of the panel, and the same
 * colours wherever a learner meets them.
 *
 * Callers identify a character either by name, as the authored lesson HTML
 * does ("Miguel:"), or by artwork key, as the seeded activities do
 * ("dark_happy"). Both resolve to the same cast entry.
 */

const CAST = {
  miguel: {
    name: 'Miguel', side: 'right',
    bg: 'var(--white)', fg: 'var(--ink)', accent: 'var(--ink)',
    art: 'dark_idle',
  },
  ana: {
    name: 'Ana', side: 'right',
    bg: 'var(--yellow-soft)', fg: 'var(--ink)', accent: 'var(--ink)',
    art: 'light_thinking',
  },
  teacher: {
    name: 'Teacher', side: 'left',
    bg: 'var(--board)', fg: 'var(--paper)', accent: 'var(--teal)',
    art: 'teacher',
  },
};

// Which cast member each drawing belongs to
const ART_TO_ID = {
  dark_idle: 'miguel', dark_happy: 'miguel', dark_serious: 'miguel',
  light_thinking: 'ana', light_happy: 'ana', light_sad: 'ana',
  teacher: 'teacher',
};

const FALLBACK = {
  name: '', side: 'right',
  bg: 'var(--white)', fg: 'var(--ink)', accent: 'var(--ink)',
  art: null,
};

// Reactions recolour the bubble, because a learner should be able to tell a
// verdict apart from ordinary dialogue without reading it.
const TONES = {
  good: { bg: 'var(--green-soft)', fg: 'var(--ink)',   accent: 'var(--ink)' },
  bad:  { bg: 'var(--red)',        fg: 'var(--white)', accent: 'var(--ink)' },
};

export function resolveCharacter({ art, speaker }) {
  if (art && ART_TO_ID[art]) {
    // Keep the specific drawing the caller asked for — a happy face, say —
    // rather than the cast member's default one.
    return { ...CAST[ART_TO_ID[art]], art };
  }
  if (speaker) {
    const found = CAST[speaker.trim().toLowerCase()];
    if (found) return found;
    return { ...FALLBACK, name: speaker.trim() };
  }
  return FALLBACK;
}

export default function SpeechLine({ art, speaker, tone, html, children }) {
  const base = resolveCharacter({ art, speaker });
  const c = tone && TONES[tone] ? { ...base, ...TONES[tone] } : base;

  const [artFailed, setArtFailed] = useState(false);
  const showArt = c.art && !artFailed;
  const initial = (c.name || '?').charAt(0).toUpperCase();

  return (
    <div className={`cd-line ${c.side === 'left' ? 'cd-left' : 'cd-right'}`}>
      {showArt ? (
        <img
          className="cd-avatar cd-avatar-img"
          src={`/assets/characters/${c.art}.png`}
          alt={c.name}
          onError={() => setArtFailed(true)}
          style={{ borderColor: c.accent }}
        />
      ) : (
        <span
          className="cd-avatar"
          style={{ background: c.accent, color: c.side === 'left' ? 'var(--board)' : 'var(--white)' }}
          aria-hidden="true"
        >
          {initial}
        </span>
      )}

      <div
        className="cd-bubble"
        style={{ background: c.bg, color: c.fg, borderColor: c.accent, '--cd-tail': c.accent }}
      >
        {c.name && <span className="cd-speaker" style={{ color: tone ? c.fg : c.accent }}>{c.name}</span>}
        {html != null
          ? <span className="rich-text" dangerouslySetInnerHTML={{ __html: html }} />
          : children}
      </div>
    </div>
  );
}
