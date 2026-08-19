import React from 'react';

/**
 * Page heading in the mathematics theme:
 *   [icon badge]  Title
 *
 * Replaces the old emoji-prefixed <h1 className="section-title"> pattern.
 * Icons are lucide-react components — no emojis anywhere in the UI.
 */
export default function SectionTitle({ icon: Icon, children }) {
  return (
    <h1 className="section-title" style={s.wrap}>
      {Icon && (
        <span style={s.badge}>
          <Icon size={20} strokeWidth={2.5} />
        </span>
      )}
      <span style={s.text}>{children}</span>
    </h1>
  );
}

const s = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.7rem',
    flexWrap: 'wrap',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
    background: 'var(--teal)',
    color: 'var(--ink)',
    border: '2px solid var(--ink)',
    boxShadow: '2px 2px 0 var(--ink)',
    flexShrink: 0,
  },
  text: {
    flex: 1,
    minWidth: 0,
  },
};
