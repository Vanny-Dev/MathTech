import React, { useEffect, useState } from 'react';
import { CalendarClock, Lock, Unlock, Save, Zap, FileWarning } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import Loader from '../../components/shared/Loader.jsx';
import { getModulesApi, setReleaseDateApi } from '../../api/moduleApi.js';
import {
  formatRelease,
  timeUntil,
  toInputValue,
  fromInputValue,
  nowIso,
} from '../../utils/releaseTime.js';

export default function TeacherSchedule() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts]   = useState({});   // moduleId -> datetime-local value
  const [saving, setSaving]   = useState({});   // moduleId -> bool
  const [notice, setNotice]   = useState(null); // { type, text }

  const load = () =>
    getModulesApi()
      .then(({ data }) => {
        setModules(data);
        setDrafts(Object.fromEntries(data.map((m) => [m._id, toInputValue(m.releaseDate)])));
      })
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  // isoOrNull: an ISO string to schedule/open, or null to lock the topic again
  const save = async (id, isoOrNull, verb) => {
    setSaving((p) => ({ ...p, [id]: true }));
    setNotice(null);
    try {
      const { data } = await setReleaseDateApi(id, isoOrNull);
      setModules((prev) => prev.map((m) => (m._id === id ? { ...m, ...data } : m)));
      // Keep the picker showing exactly what was saved, so it never resets
      setDrafts((prev) => ({ ...prev, [id]: toInputValue(data.releaseDate) }));

      setNotice({
        type: 'ok',
        text: !data.releaseDate
          ? `"${data.title}" is now locked`
          : data.isReleased
          ? `"${data.title}" is now OPEN to students`
          : `"${data.title}" opens ${formatRelease(data.releaseDate)}`,
      });
    } catch (err) {
      setNotice({ type: 'err', text: err.response?.data?.message || `Could not ${verb} this topic` });
    } finally {
      setSaving((p) => ({ ...p, [id]: false }));
    }
  };

  if (loading) return <Loader text="Loading schedule..." />;

  return (
    <div>
      <SectionTitle icon={CalendarClock}>Topic Schedule</SectionTitle>

      <div className="chalk-card" style={{ maxWidth: '820px', marginBottom: '1.25rem' }}>
        <p style={{ fontFamily: 'Nunito, sans-serif', lineHeight: 1.7 }}>
          <strong>Every topic starts locked.</strong> Students can see it and its
          countdown, but the lesson and quiz stay closed — enforced on the server,
          not just hidden in the interface. Pick a date and Save to schedule a
          topic, or press Open now to release it immediately. Your choice is
          saved and is not reset when the server restarts.
        </p>
      </div>

      {notice && (
        <div style={{ ...s.notice, background: notice.type === 'ok' ? 'var(--green-soft)' : 'var(--red-soft)' }}>
          {notice.text}
        </div>
      )}

      {modules.length === 0 ? (
        <div className="comic-card" style={{ maxWidth: '600px' }}>No modules found.</div>
      ) : (
        <div style={s.list}>
          {modules.map((m) => {
            const released   = m.isReleased;
            const scheduled  = !!m.releaseDate;
            const countdown  = timeUntil(m.releaseDate);
            const dirty      = drafts[m._id] !== toInputValue(m.releaseDate);
            const busy       = saving[m._id];

            return (
              <div key={m._id} className="comic-card" style={s.card}>
                <div style={s.head}>
                  <span style={{ ...s.badge, background: released ? 'var(--green)' : 'var(--yellow)' }}>
                    {released ? <Unlock size={15} strokeWidth={2.5} /> : <Lock size={15} strokeWidth={2.5} />}
                  </span>
                  <span style={s.title}>{m.title}</span>
                  {m.isPublished === false && (
                    <span className="formula-chip" style={s.draft}>
                      <FileWarning size={11} /> draft
                    </span>
                  )}
                  <span className="formula-chip">{released ? 'OPEN' : 'LOCKED'}</span>
                </div>

                <div style={s.status}>
                  {!scheduled
                    ? 'Locked — no date set yet'
                    : `${released ? 'Opened' : 'Opens'} ${formatRelease(m.releaseDate)}`}
                  {countdown && <span style={s.countdown}> · {countdown}</span>}
                </div>

                <div style={s.row}>
                  <input
                    type="datetime-local"
                    className="math-input"
                    style={{ flex: '1 1 220px', minWidth: 0 }}
                    value={drafts[m._id] ?? ''}
                    onChange={(e) => setDrafts((p) => ({ ...p, [m._id]: e.target.value }))}
                  />
                  <button
                    className="btn btn-teal"
                    style={s.btn}
                    disabled={busy || !dirty || !drafts[m._id]}
                    onClick={() => save(m._id, fromInputValue(drafts[m._id]), 'schedule')}
                    title="Save the chosen date"
                  >
                    <Save size={14} /> {busy ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    className="btn btn-green"
                    style={s.btn}
                    disabled={busy || released}
                    onClick={() => save(m._id, nowIso(), 'open')}
                    title="Release this topic to students right now"
                  >
                    <Zap size={14} /> Open now
                  </button>
                  <button
                    className="btn btn-outline"
                    style={s.btn}
                    disabled={busy || !scheduled}
                    onClick={() => save(m._id, null, 'lock')}
                    title="Close this topic again and clear its date"
                  >
                    <Lock size={14} /> Lock
                  </button>
                </div>

                {m.isPublished === false && (
                  <div style={s.warn}>
                    This module is a draft. Students will not see it even after the release
                    date passes until it is published.
                  </div>
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
  list: { display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '820px' },
  card: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  head: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' },
  badge: {
    width: '30px', height: '30px',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--ink)', border: '2px solid var(--ink)', flexShrink: 0,
  },
  title: { fontFamily: 'Fredoka One, cursive', fontSize: '1rem', flex: 1, minWidth: 0 },
  draft: { background: 'var(--red)', color: 'var(--white)', gap: '0.2rem' },
  status: { fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem', color: 'var(--muted-strong)' },
  countdown: { fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', fontWeight: 700, color: 'var(--red)' },
  row: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' },
  btn: { fontSize: '0.85rem', padding: '0.5rem 0.9rem' },
  notice: {
    border: '2px solid var(--ink)', padding: '0.6rem 0.9rem', marginBottom: '1rem',
    maxWidth: '820px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.88rem',
  },
  warn: {
    fontFamily: 'Nunito, sans-serif', fontSize: '0.8rem',
    background: 'var(--yellow-soft)', border: '2px dashed var(--muted)', padding: '0.5rem 0.7rem',
  },
};
