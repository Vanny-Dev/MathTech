import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Percent, SearchX, Lock } from 'lucide-react';
import AttemptList from './AttemptList.jsx';

/**
 * Shown in place of the questions once a student has answered a topic's graded
 * activity perfectly.
 *
 * A student may attempt the activity as often as they need, and every attempt
 * is kept. A 100% score is what ends it: there is nothing left to improve, so
 * the questions close and what remains useful — the score and the worked
 * explanations — stays open behind the two buttons.
 */
export default function ActivityCompleted({ result }) {
  const navigate = useNavigate();

  const attempts = result?.attempts ?? 0;
  const history  = result?.history ?? [];
  const best     = result?.bestPercentage ?? result?.percentage ?? 100;

  const perfectedOn = history.find((h) => h.percentage === 100);
  const when = perfectedOn?.submittedAt ?? result?.submittedAt;
  const shown = when
    ? new Date(when).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit',
      })
    : null;

  return (
    <div className="comic-card" style={s.card}>
      <div style={s.head}>
        <span style={s.badge}>
          <Trophy size={19} strokeWidth={2.6} />
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={s.title}>Perfect score</div>
          <div style={s.sub}>
            <Lock size={12} strokeWidth={2.5} /> This topic&rsquo;s activity is closed
          </div>
        </div>
      </div>

      <div style={s.scoreRow}>
        <span style={s.scoreValue}>{best}%</span>
        <span style={s.scoreDetail}>
          {attempts === 1
            ? 'on your first attempt'
            : `after ${attempts} attempts`}
        </span>
      </div>

      {shown && <div style={s.when}>Perfected {shown}</div>}

      <p style={s.note}>
        You answered every question correctly, so there is nothing left to try
        again for. Your score and the explanations stay open.
      </p>

      {/* compact: the closing rule is already spelled out above */}
      {history.length > 1 && <AttemptList history={history} compact />}

      <div style={s.actions}>
        <button className="btn btn-teal" onClick={() => navigate('/feedback')}>
          <Percent size={15} /> View my score
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/review')}>
          <SearchX size={15} /> Review the answers
        </button>
      </div>
    </div>
  );
}

const s = {
  card: { maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: '0.7rem' },

  head: { display: 'flex', alignItems: 'center', gap: '0.7rem' },
  badge: {
    flexShrink: 0,
    width: '38px',
    height: '38px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--green)',
    color: 'var(--ink)',
    border: '2px solid var(--ink)',
    boxShadow: '2px 2px 0 var(--ink)',
  },
  title: {
    fontFamily: 'Fredoka One, cursive',
    fontSize: '1.15rem',
    letterSpacing: '0.5px',
    lineHeight: 1.25,
  },
  sub: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: 'var(--muted-strong)',
    marginTop: '0.15rem',
  },

  scoreRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.6rem',
    flexWrap: 'wrap',
    background: 'var(--paper)',
    border: '2px solid var(--ink)',
    padding: '0.55rem 0.8rem',
  },
  scoreValue: {
    fontFamily: 'Fredoka One, cursive',
    fontSize: '1.9rem',
    lineHeight: 1,
    color: 'var(--green)',
  },
  scoreDetail: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.82rem',
    fontWeight: 700,
    color: 'var(--muted-strong)',
  },

  when: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.72rem',
    color: 'var(--muted-strong)',
  },
  note: {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.92rem',
    lineHeight: 1.7,
  },
  actions: { display: 'flex', gap: '0.6rem', flexWrap: 'wrap' },
};
