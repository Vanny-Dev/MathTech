import React, { useEffect, useState } from 'react';
import { BookMarked, Lock, ArrowRight, CalendarClock, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import Loader from '../../components/shared/Loader.jsx';
import { getModulesApi } from '../../api/moduleApi.js';
import { useWorkbook } from '../../context/WorkbookContext.jsx';
import { formatRelease, timeUntil } from '../../utils/releaseTime.js';

export default function TopicsPage() {
  const navigate = useNavigate();
  const { moduleId, setModuleId } = useWorkbook();

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, forceTick]         = useState(0);

  useEffect(() => {
    getModulesApi()
      .then(({ data }) => setModules(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Re-render every 30s so countdowns tick down and a topic unlocks on time
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const openTopic = (m) => {
    setModuleId(m._id);
    navigate('/competencies');
  };

  if (loading) return <Loader text="Loading topics..." />;

  return (
    <div>
      <SectionTitle icon={BookMarked}>Topics</SectionTitle>

      {modules.length === 0 ? (
        <div className="comic-card" style={{ maxWidth: '600px' }}>
          No topics have been published yet. Check back soon.
        </div>
      ) : (
        <div style={s.list}>
          {modules.map((m) => {
            const locked    = !m.isReleased;
            const selected  = m._id === moduleId;
            const countdown = timeUntil(m.releaseDate);

            return (
              <div
                key={m._id}
                className="comic-card"
                style={{
                  ...s.card,
                  ...(locked ? s.cardLocked : {}),
                  ...(selected && !locked ? s.cardSelected : {}),
                }}
              >
                <div style={s.head}>
                  <span style={{ ...s.badge, background: locked ? 'var(--muted)' : 'var(--teal)' }}>
                    {locked ? <Lock size={16} strokeWidth={2.5} /> : <BookMarked size={16} strokeWidth={2.5} />}
                  </span>
                  <span style={s.title}>{m.title}</span>
                  {selected && !locked && (
                    <span className="formula-chip light" style={s.chip}>
                      <Check size={11} strokeWidth={3} /> current
                    </span>
                  )}
                </div>

                <div style={s.meta}>
                  {[m.gradeLevel, m.quarter, m.subject].filter(Boolean).join(' · ')}
                </div>

                {locked ? (
                  <>
                    <div style={s.lockRow}>
                      <CalendarClock size={15} strokeWidth={2.5} />
                      <span>
                        {m.releaseDate
                          ? `Opens ${formatRelease(m.releaseDate)}`
                          : 'Not open yet'}
                      </span>
                    </div>
                    {countdown ? (
                      <div style={s.countdown}>{countdown}</div>
                    ) : !m.releaseDate ? (
                      <div style={s.soon}>Your teacher has not opened this topic yet.</div>
                    ) : null}
                    <button className="btn btn-outline" style={s.btn} disabled>
                      <Lock size={14} /> Locked
                    </button>
                  </>
                ) : (
                  <>
                    <div style={s.openRow}>
                      Opened {formatRelease(m.releaseDate)}
                    </div>
                    <button
                      className={selected ? 'btn btn-teal' : 'btn btn-primary'}
                      style={s.btn}
                      onClick={() => openTopic(m)}
                    >
                      {selected ? 'Continue' : 'Open topic'} <ArrowRight size={15} />
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const s = {
  list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem',
    maxWidth: '900px',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  cardLocked: {
    opacity: 0.75,
  },
  cardSelected: {
    borderColor: 'var(--teal)',
    boxShadow: '5px 5px 0 var(--teal)',
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  badge: {
    width: '30px',
    height: '30px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--ink)',
    border: '2px solid var(--ink)',
    flexShrink: 0,
  },
  title: {
    fontFamily: 'Fredoka One, cursive',
    fontSize: '1rem',
    flex: 1,
    minWidth: 0,
  },
  chip: {
    fontSize: '0.62rem',
    gap: '0.2rem',
  },
  meta: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.7rem',
    color: 'var(--muted-strong)',
  },
  lockRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontFamily: 'Nunito, sans-serif',
    fontWeight: 700,
    fontSize: '0.85rem',
  },
  countdown: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--red)',
  },
  soon: {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.78rem',
    lineHeight: 1.5,
    color: 'var(--muted-strong)',
  },
  openRow: {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.85rem',
    color: 'var(--muted-strong)',
  },
  btn: {
    marginTop: '0.4rem',
    width: '100%',
    fontSize: '0.9rem',
  },
};
