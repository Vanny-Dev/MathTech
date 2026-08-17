import React, { useEffect, useState } from 'react';
import { PenLine, Save, Pencil, X, ArrowRight, CircleCheckBig, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import Loader from '../../components/shared/Loader.jsx';
import { useWorkbook } from '../../context/WorkbookContext.jsx';
import { getReflectionApi, saveReflectionApi } from '../../api/reflectionApi.js';

const MAX = 5000;

const PROMPTS = [
  'What is the most important thing you learned in this topic?',
  'Which part did you find difficult, and how did you work through it?',
  'Where could you use this in real life?',
];

export default function ReflectionPage() {
  const { moduleId } = useWorkbook();
  const navigate     = useNavigate();

  const [saved, setSaved]     = useState('');      // what is stored on the server
  const [draft, setDraft]     = useState('');      // what is in the textarea
  const [meta, setMeta]       = useState({ createdAt: null, updatedAt: null });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!moduleId) { setLoading(false); return; }
    getReflectionApi(moduleId)
      .then(({ data }) => {
        setSaved(data.content || '');
        setDraft(data.content || '');
        setMeta({ createdAt: data.createdAt, updatedAt: data.updatedAt });
        // Nothing written yet -> open straight into the editor
        setEditing(!data.content);
      })
      .catch((err) => {
        if (err.response?.status === 423) setError('This topic is not open yet.');
        else console.error(err);
      })
      .finally(() => setLoading(false));
  }, [moduleId]);

  const handleSave = async () => {
    const text = draft.trim();
    if (!text) { setError('Please write something before saving.'); return; }

    setSaving(true);
    setError('');
    try {
      const { data } = await saveReflectionApi(moduleId, text);
      setSaved(data.content);
      setDraft(data.content);
      setMeta({ createdAt: data.createdAt, updatedAt: data.updatedAt });
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save your reflection.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(saved);          // throw away the edit, keep what is stored
    setEditing(false);
    setError('');
  };

  if (loading) return <Loader text="Loading your reflection..." />;

  if (!moduleId) {
    return (
      <div>
        <SectionTitle icon={PenLine} label="reflect">Reflection</SectionTitle>
        <div className="comic-card" style={{ maxWidth: '640px' }}>
          Choose a topic first, then come back to write your reflection.{' '}
          <button className="btn btn-teal" style={{ marginTop: '0.6rem' }} onClick={() => navigate('/topics')}>
            Go to Topics <ArrowRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  const edited = meta.updatedAt && meta.createdAt &&
    new Date(meta.updatedAt).getTime() - new Date(meta.createdAt).getTime() > 1000;
  const stamp = (d) => new Date(d).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });

  return (
    <div>
      <SectionTitle icon={PenLine} label="reflect">Reflection</SectionTitle>

      <div className="chalk-card" style={{ maxWidth: '720px', marginBottom: '1.25rem' }}>
        <p style={{ fontFamily: 'Nunito, sans-serif', lineHeight: 1.7, marginBottom: '0.6rem' }}>
          Write what you understood from this topic in your own words. There is no
          score for this. You can come back and edit it any time.
        </p>
        <ul style={s.prompts}>
          {PROMPTS.map((p) => <li key={p}>{p}</li>)}
        </ul>
      </div>

      {/* Students must know this is not private before they write anything */}
      <div style={s.visibility}>
        <Eye size={15} strokeWidth={2.5} style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>
          Your teacher can read your reflection. Write honestly about the lesson,
          but do not put anything private here.
        </span>
      </div>

      {error && <div style={s.error}>{error}</div>}

      {editing ? (
        <div className="comic-card" style={s.card}>
          <textarea
            className="math-input"
            style={s.textarea}
            value={draft}
            maxLength={MAX}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Start writing your reflection here..."
            autoFocus
          />

          <div style={s.row}>
            <span style={s.count}>{draft.length} / {MAX}</span>
            <div style={s.actions}>
              {saved && (
                <button className="btn btn-outline" style={s.btn} onClick={handleCancel} disabled={saving}>
                  <X size={14} /> Cancel
                </button>
              )}
              <button
                className="btn btn-teal"
                style={s.btn}
                onClick={handleSave}
                disabled={saving || !draft.trim()}
              >
                <Save size={14} /> {saving ? 'Saving...' : saved ? 'Save changes' : 'Save reflection'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="comic-card" style={s.card}>
          <div style={s.savedBanner}>
            <CircleCheckBig size={15} strokeWidth={2.5} />
            <span>
              Saved {stamp(meta.createdAt)}
              {edited && <> · edited {stamp(meta.updatedAt)}</>}
            </span>
          </div>

          <p style={s.savedText}>{saved}</p>

          <button className="btn btn-yellow" style={{ ...s.btn, alignSelf: 'flex-start' }} onClick={() => setEditing(true)}>
            <Pencil size={14} /> Edit reflection
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.25rem', maxWidth: '720px' }}>
        <button className="btn btn-outline" onClick={() => navigate('/lesson/examples')}>
          Back to Examples
        </button>
        <button className="btn btn-primary" onClick={() => navigate('/activities')}>
          Go to Activities <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

const s = {
  card: {
    maxWidth: '720px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  },
  prompts: {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.88rem',
    lineHeight: 1.9,
    paddingLeft: '1.1rem',
    margin: 0,
  },
  textarea: {
    width: '100%',
    minHeight: '220px',
    resize: 'vertical',
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.95rem',
    lineHeight: 1.7,
    letterSpacing: 0,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  count: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.72rem',
    fontWeight: 700,
    color: 'var(--muted-strong)',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  btn: { fontSize: '0.88rem', padding: '0.5rem 0.9rem' },
  savedBanner: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'var(--green)',
  },
  savedText: {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.95rem',
    lineHeight: 1.8,
    whiteSpace: 'pre-wrap',      // keep the student's own line breaks
    overflowWrap: 'anywhere',
    margin: 0,
  },
  visibility: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.45rem',
    maxWidth: '720px',
    marginBottom: '1.25rem',
    background: 'var(--yellow-soft)',
    border: '2px dashed var(--muted)',
    padding: '0.55rem 0.8rem',
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.85rem',
    lineHeight: 1.6,
  },
  error: {
    maxWidth: '720px',
    marginBottom: '1rem',
    background: 'var(--red-soft)',
    border: '2px solid var(--ink)',
    padding: '0.6rem 0.9rem',
    fontFamily: 'Nunito, sans-serif',
    fontWeight: 700,
    fontSize: '0.88rem',
  },
};
