import React from 'react';

/**
 * Every graded attempt a student has made on a topic, oldest first.
 *
 * Attempts are unlimited, so a student retrying needs to see what they have
 * already scored — otherwise there is no way to tell whether they are
 * improving. The perfect attempt, if there is one, is the one that closed the
 * topic and is marked as such.
 */
export default function AttemptList({ history = [], compact = false }) {
  if (history.length === 0) return null;

  return (
    <div style={s.wrap}>
      <div style={s.label}>Your attempts</div>
      <div style={s.row}>
        {history.map((h) => {
          const perfect = h.percentage === 100;
          return (
            <span
              key={h.attempt}
              style={{
                ...s.chip,
                ...(perfect ? s.chipPerfect : {}),
              }}
              title={
                h.submittedAt
                  ? new Date(h.submittedAt).toLocaleString()
                  : `Attempt ${h.attempt}`
              }
            >
              <span style={s.chipNum}>#{h.attempt}</span>
              {h.percentage}%
            </span>
          );
        })}
      </div>
      {!compact && (
        <div style={s.hint}>
          The activity closes once you reach 100%.
        </div>
      )}
    </div>
  );
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  label: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.66rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: 'var(--muted-strong)',
  },
  row: { display: 'flex', gap: '0.35rem', flexWrap: 'wrap' },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    background: 'var(--white)',
    border: '2px solid var(--ink)',
    padding: '0.15rem 0.45rem',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.78rem',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  chipPerfect: { background: 'var(--green)' },
  chipNum: { fontSize: '0.66rem', color: 'var(--muted-strong)' },
  hint: {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.78rem',
    color: 'var(--muted-strong)',
  },
};
