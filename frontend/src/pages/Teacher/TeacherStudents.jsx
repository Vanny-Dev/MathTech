import React, { useEffect, useMemo, useState } from 'react';
import { Users, Trash2, TriangleAlert, X, Search, CheckSquare, Square } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import Loader from '../../components/shared/Loader.jsx';
import useMediaQuery from '../../hooks/useMediaQuery.js';
import { getAllStudentsApi, deleteStudentsApi } from '../../api/teacherApi.js';

export default function TeacherStudents() {
  // A table cannot be read on a phone, so below 700px the same data is shown
  // as cards. Between 700 and 1023px the table fits but the Email column does
  // not, so it is dropped rather than squeezed.
  const isPhone   = useMediaQuery('(max-width: 699px)');
  const isCompact = useMediaQuery('(max-width: 1023px)');

  const [students, setStudents] = useState([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [picked, setPicked]     = useState(() => new Set());
  const [confirm, setConfirm]   = useState(false);
  const [busy, setBusy]         = useState(false);
  const [notice, setNotice]     = useState(null);

  useEffect(() => {
    getAllStudentsApi()
      .then(({ data }) => setStudents(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Sorted once, then numbered by position — so after a delete the list
  // renumbers 1..n with no gaps rather than keeping the old positions.
  const ordered = useMemo(
    () => [...students].sort((a, b) => a.fullname.localeCompare(b.fullname)),
    [students]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ordered;
    return ordered.filter(
      (st) =>
        st.fullname.toLowerCase().includes(q) ||
        st.username.toLowerCase().includes(q) ||
        (st.email || '').toLowerCase().includes(q)
    );
  }, [ordered, search]);

  const toggle = (id) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Select-all applies to what is currently visible, not the whole roster —
  // ticking it while a search is active must not select hidden students.
  const visibleIds = filtered.map((st) => st._id);
  const allVisiblePicked = visibleIds.length > 0 && visibleIds.every((id) => picked.has(id));

  const toggleAll = () =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (allVisiblePicked) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });

  const pickedStudents = ordered.filter((st) => picked.has(st._id));
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

  const handleDelete = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const { data } = await deleteStudentsApi([...picked]);
      setStudents((prev) => prev.filter((st) => !picked.has(st._id)));
      setPicked(new Set());
      setConfirm(false);
      setNotice({
        type: 'ok',
        text:
          `Deleted ${plural(data.deleted, 'student')} — also removed ` +
          `${plural(data.alsoRemoved.submissions, 'submission')}, ` +
          `${plural(data.alsoRemoved.progress, 'progress record')} and ` +
          `${plural(data.alsoRemoved.reflections, 'reflection')}.`,
      });
    } catch (err) {
      setNotice({
        type: 'err',
        text: err.response?.data?.message || 'Could not delete the selected accounts',
      });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader text="Loading students..." />;

  const anyPicked = picked.size > 0;

  return (
    <div style={{ paddingBottom: isPhone && anyPicked ? '5.5rem' : 0 }}>
      <SectionTitle icon={Users}>All Students</SectionTitle>

      {notice && (
        <div style={{ ...s.notice, background: notice.type === 'ok' ? 'var(--green-soft)' : 'var(--red-soft)' }}>
          {notice.text}
        </div>
      )}

      {/* Search only. Delete lives in the selection bar below, so a
          destructive button is never sitting next to a text field. */}
      <div style={s.searchWrap}>
        <Search size={15} strokeWidth={2.5} style={s.searchIcon} />
        <input
          className="comic-input"
          placeholder={isPhone ? 'Search students...' : 'Search name, username or email...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '2.1rem' }}
        />
      </div>

      <div style={s.countRow}>
        <span style={s.total}>{filtered.length} student{filtered.length === 1 ? '' : 's'}</span>
        {search && <span style={s.of}>of {students.length} total</span>}

        {/* On a phone there is no table header to hold select-all */}
        {isPhone && filtered.length > 0 && (
          <button style={s.selectAllBtn} onClick={toggleAll}>
            {allVisiblePicked ? <CheckSquare size={14} /> : <Square size={14} />}
            {allVisiblePicked ? 'Clear all' : 'Select all'}
          </button>
        )}
      </div>

      {/* ── Selection bar: only appears when something is selected.
             Sticky at the bottom on a phone (thumb reach), inline elsewhere. ── */}
      {anyPicked && (
        <div style={isPhone ? s.barPhone : s.barInline}>
          <span style={s.barCount}>{picked.size} selected</span>
          <button className="btn btn-outline" style={s.barBtn} onClick={() => setPicked(new Set())}>
            Clear
          </button>
          <button className="btn btn-red" style={s.barBtn} onClick={() => setConfirm(true)}>
            <Trash2 size={15} /> Delete
          </button>
        </div>
      )}

      {/* ── PHONE: cards ── */}
      {isPhone ? (
        <div style={s.cards}>
          {filtered.length === 0 ? (
            <div style={s.empty}>
              {search ? 'No students match that search' : 'No students registered yet'}
            </div>
          ) : (
            filtered.map((st, i) => {
              const on = picked.has(st._id);
              return (
                <div
                  key={st._id}
                  onClick={() => toggle(st._id)}
                  style={{
                    ...s.card,
                    // Solid fill, not the graph-paper .comic-card — grid lines
                    // behind small text made the cards hard to read.
                    background: on ? 'var(--red-soft)' : i % 2 === 0 ? 'var(--white)' : 'var(--paper-dark)',
                    ...(on ? s.cardOn : {}),
                  }}
                >
                  <div style={s.cardTop}>
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggle(st._id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${st.fullname}`}
                      style={s.checkbox}
                    />
                    <span style={s.avatar}>{st.fullname[0]?.toUpperCase()}</span>
                    <span style={s.cardName}>{st.fullname}</span>
                    <span style={s.cardNum}>{i + 1}</span>
                  </div>
                  <div style={s.cardMeta}>@{st.username}</div>
                  <div style={s.cardMeta}>{st.email}</div>
                  <div style={s.cardJoined}>Joined {new Date(st.createdAt).toLocaleDateString()}</div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* ── TABLET / DESKTOP: table ── */
        <div className="comic-card" style={{ maxWidth: '860px', padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr style={s.headRow}>
                  <th style={{ ...s.th, width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={allVisiblePicked}
                      onChange={toggleAll}
                      disabled={filtered.length === 0}
                      aria-label="Select all visible students"
                      style={s.checkbox}
                    />
                  </th>
                  <th style={{ ...s.th, width: '44px' }}>#</th>
                  <th style={s.th}>Full Name</th>
                  <th style={s.th}>Username</th>
                  {!isCompact && <th style={s.th}>Email</th>}
                  <th style={s.th}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={isCompact ? 5 : 6} style={s.emptyCell}>
                      {search ? 'No students match that search' : 'No students registered yet'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((st, i) => {
                    const on = picked.has(st._id);
                    return (
                      <tr
                        key={st._id}
                        onClick={() => toggle(st._id)}
                        style={{
                          ...s.row,
                          background: on
                            ? 'var(--red-soft)'
                            : i % 2 === 0
                            ? 'var(--white)'
                            : 'var(--paper)',
                        }}
                      >
                        <td style={s.td}>
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => toggle(st._id)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Select ${st.fullname}`}
                            style={s.checkbox}
                          />
                        </td>
                        {/* Numbered by position, so the list stays 1..n after any delete */}
                        <td style={{ ...s.td, ...s.num }}>{i + 1}</td>
                        <td style={{ ...s.td, fontWeight: 700 }}>
                          <div style={s.nameCell}>
                            <span style={s.avatar}>{st.fullname[0]?.toUpperCase()}</span>
                            <span style={s.nameText}>{st.fullname}</span>
                          </div>
                        </td>
                        <td style={{ ...s.td, color: 'var(--muted-strong)' }}>@{st.username}</td>
                        {!isCompact && (
                          <td style={{ ...s.td, color: 'var(--muted-strong)', fontSize: '0.86rem' }}>
                            {st.email}
                          </td>
                        )}
                        <td style={{ ...s.td, ...s.num }}>
                          {new Date(st.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation */}
      {confirm && (
        <div style={s.overlay} onClick={() => !busy && setConfirm(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHead}>
              <span style={s.warnBadge}><TriangleAlert size={18} strokeWidth={2.5} /></span>
              <h3 style={s.modalTitle}>
                Delete {picked.size} account{picked.size === 1 ? '' : 's'}?
              </h3>
              <button style={s.close} onClick={() => setConfirm(false)} disabled={busy} aria-label="Cancel">
                <X size={18} strokeWidth={3} />
              </button>
            </div>

            <p style={s.modalBody}>
              This permanently removes the account together with every quiz
              submission, progress record and reflection it owns.
              <strong> This cannot be undone.</strong>
            </p>

            <ul style={s.nameList}>
              {pickedStudents.slice(0, 8).map((st) => (
                <li key={st._id}>
                  {st.fullname} <span style={s.dim}>@{st.username}</span>
                </li>
              ))}
              {pickedStudents.length > 8 && (
                <li style={s.dim}>and {pickedStudents.length - 8} more</li>
              )}
            </ul>

            <div style={s.modalActions}>
              <button className="btn btn-outline" style={s.modalBtn} onClick={() => setConfirm(false)} disabled={busy}>
                Cancel
              </button>
              <button className="btn btn-red" style={s.modalBtn} onClick={handleDelete} disabled={busy}>
                <Trash2 size={15} /> {busy ? 'Deleting...' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  searchWrap: { position: 'relative', width: '100%', maxWidth: '380px', marginBottom: '0.8rem' },
  searchIcon: { position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' },

  countRow: { display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.8rem', fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem' },
  total: { fontWeight: 700 },
  of: { color: 'var(--muted)' },
  selectAllBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
    background: 'var(--white)', border: '2px solid var(--ink)', boxShadow: '2px 2px 0 var(--ink)',
    padding: '0.25rem 0.6rem', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.78rem',
    cursor: 'pointer', marginLeft: 'auto',
  },

  // Selection bar — inline on tablet/desktop
  barInline: {
    display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap',
    maxWidth: '860px', marginBottom: '0.8rem',
    background: 'var(--board)', border: '3px solid var(--ink)', boxShadow: '3px 3px 0 var(--ink)',
    padding: '0.55rem 0.8rem',
  },
  // Selection bar — pinned within thumb reach on a phone
  barPhone: {
    position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1000,
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: 'var(--board)', borderTop: '3px solid var(--ink)',
    padding: '0.7rem 0.9rem',
  },
  barCount: {
    flex: 1, minWidth: 0,
    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', fontWeight: 700,
    color: 'var(--teal)',
  },
  barBtn: { fontSize: '0.82rem', padding: '0.4rem 0.8rem', flexShrink: 0 },

  // Table
  table: { width: '100%', borderCollapse: 'collapse', fontFamily: 'Nunito, sans-serif' },
  headRow: { background: 'var(--board)', color: 'var(--teal)' },
  th: { padding: '0.6rem 0.9rem', textAlign: 'left', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' },
  row: { borderBottom: '1px solid var(--paper-dark)', cursor: 'pointer' },
  td: { padding: '0.55rem 0.9rem', fontSize: '0.9rem' },
  num: { fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: 'var(--muted-strong)', whiteSpace: 'nowrap' },
  nameCell: { display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 0 },
  nameText: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  emptyCell: { padding: '1.6rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem' },

  // Phone cards
  cards: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  card: {
    padding: '0.7rem 0.8rem', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', gap: '0.15rem',
    border: '3px solid var(--ink)', boxShadow: '3px 3px 0 var(--ink)',
  },
  cardOn: { borderColor: 'var(--red)', boxShadow: '3px 3px 0 var(--red)' },
  cardTop: { display: 'flex', alignItems: 'center', gap: '0.55rem' },
  // Same face and weight as the table's Full Name cell, so the name does not
  // change typeface between the desktop table and the phone card.
  cardName: {
    flex: 1, minWidth: 0,
    fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.95rem',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  cardNum: { fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: 'var(--muted)', flexShrink: 0 },
  cardMeta: { fontFamily: 'Nunito, sans-serif', fontSize: '0.86rem', color: 'var(--ink)', paddingLeft: '2.9rem', overflowWrap: 'anywhere' },
  cardJoined: { fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'var(--muted-strong)', paddingLeft: '2.9rem', marginTop: '0.15rem' },
  empty: {
    textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem',
    background: 'var(--white)', border: '3px solid var(--ink)', boxShadow: '3px 3px 0 var(--ink)',
    padding: '1.4rem',
  },

  checkbox: { width: '18px', height: '18px', accentColor: 'var(--red)', cursor: 'pointer', flexShrink: 0 },
  avatar: {
    width: '28px', height: '28px', flexShrink: 0,
    background: 'var(--teal)', border: '2px solid var(--ink)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Fredoka One, cursive', fontSize: '0.9rem',
  },

  notice: {
    maxWidth: '860px', marginBottom: '1rem',
    border: '2px solid var(--ink)', padding: '0.6rem 0.9rem',
    fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.88rem',
  },

  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1500, padding: '1rem',
  },
  modal: {
    width: '100%', maxWidth: '440px',
    background: 'var(--white)', border: '3px solid var(--ink)', boxShadow: '6px 6px 0 var(--ink)',
    padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.7rem',
  },
  modalHead: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  warnBadge: {
    width: '34px', height: '34px', flexShrink: 0,
    background: 'var(--red)', color: 'var(--white)', border: '2px solid var(--ink)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  },
  modalTitle: { fontFamily: 'Fredoka One, cursive', fontSize: '1.05rem', flex: 1, minWidth: 0 },
  close: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)', display: 'flex', padding: '0.2rem' },
  modalBody: { fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem', lineHeight: 1.7 },
  nameList: {
    fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem', lineHeight: 1.7,
    background: 'var(--paper)', border: '2px dashed var(--muted)',
    padding: '0.5rem 0.6rem 0.5rem 1.6rem', margin: 0, maxHeight: '170px', overflowY: 'auto',
  },
  dim: { color: 'var(--muted)' },
  modalActions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' },
  modalBtn: { fontSize: '0.88rem', padding: '0.5rem 0.9rem' },
};
