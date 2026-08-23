import React, { useEffect, useState, useCallback } from 'react';
import { Activity, RefreshCw, ArrowRight } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getModulesApi } from '../../api/moduleApi.js';
import { getModuleProgressApi } from '../../api/teacherApi.js';
import Loader from '../../components/shared/Loader.jsx';
import { getSocket } from '../../realtime/socket.js';


/**
 * The three states of a topic's Independent Activity: never opened, being
 * taken right now, and finished. See backend/src/utils/completion.js.
 */
const STATUS_COLORS = {
  completed:   { bg: 'var(--green)',      label: 'Completed' },
  in_progress: { bg: 'var(--yellow)',     label: 'In Progress' },
  not_started: { bg: 'var(--paper-dark)', label: 'Not Started' },
};

export default function TeacherMonitor() {
  const navigate     = useNavigate();
  const [params]     = useSearchParams();

  const [modules, setModules]     = useState([]);
  const [selected, setSelected]   = useState(params.get('moduleId') || '');
  const [students, setStudents]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // studentId -> { answered, total, since } for whoever has the activity open
  // right now. Separate from `students`, which is the stored record: a student
  // can be live without their saved status having changed yet.
  const [live, setLive] = useState({});
  const [liveConnected, setLiveConnected] = useState(false);

  // Load modules once
  useEffect(() => {
    getModulesApi()
      .then(({ data }) => {
        setModules(data);
        if (!selected && data.length > 0) setSelected(data[0]._id);
      })
      .catch(console.error);
  }, []);

  // Fetch student progress
  const fetchProgress = useCallback(async (isRefresh = false) => {
    if (!selected) return;
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const { data } = await getModuleProgressApi(selected);
      setStudents(data);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, [selected]);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  // Auto-refresh stays as the safety net. The socket carries the changes as
  // they happen, but a dropped connection or a missed event should not leave
  // the monitor wrong for the rest of the lesson, so keep polling — just far
  // less often now that it is no longer the only source of updates.
  useEffect(() => {
    const interval = setInterval(() => fetchProgress(true), 120000);
    return () => clearInterval(interval);
  }, [fetchProgress]);

  // ── Live updates ──────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onConnect    = () => setLiveConnected(true);
    const onDisconnect = () => setLiveConnected(false);

    // The whole picture, handed over when this teacher connects
    const onPresenceAll = (rows) => {
      const next = {};
      rows.forEach((r) => { next[r.studentId] = r; });
      setLive(next);
    };

    // One student opened, advanced through, or left the activity
    const onPresence = ({ studentId, live: row }) => {
      setLive((prev) => {
        const next = { ...prev };
        if (row) next[studentId] = row;
        else delete next[studentId];
        return next;
      });
    };

    // A stored status changed — patch that row in place rather than refetching
    // the whole class for one student.
    const onStatus = (change) => {
      setStudents((prev) => prev.map((s) => {
        if (s.student._id !== change.studentId) return s;
        if (change.status === 'completed') {
          const best = Math.max(s.bestScore ?? 0, change.percentage ?? 0);
          return {
            ...s,
            status: 'completed',
            attempts: change.attempt ?? (s.attempts || 0) + 1,
            latestScore: change.percentage ?? s.latestScore,
            bestScore: best,
            latestSubmissionAt: change.submittedAt ?? s.latestSubmissionAt,
          };
        }
        // Only ever move forwards: a fresh "in progress" must not undo a
        // completed row when a student reopens the activity to try again.
        if (s.status === 'completed') return s;
        return { ...s, status: change.status };
      }));
      setLastRefreshed(new Date());
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('monitor:presence:all', onPresenceAll);
    socket.on('monitor:presence', onPresence);
    socket.on('monitor:status', onStatus);
    if (socket.connected) setLiveConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('monitor:presence:all', onPresenceAll);
      socket.off('monitor:presence', onPresence);
      socket.off('monitor:status', onStatus);
    };
  }, []);

  if (loading) return <Loader text="Loading student progress..." />;

  return (
    <div>
      <SectionTitle icon={Activity}>Student Monitor</SectionTitle>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
        <select
          className="comic-input"
          style={{ flex: '1 1 200px', minWidth: 0, maxWidth: '320px' }}
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {modules.map((m) => <option key={m._id} value={m._id}>{m.title}</option>)}
        </select>

        <button
          className="btn btn-blue"
          onClick={() => fetchProgress(true)}
          disabled={refreshing}
        >
          <RefreshCw size={15} style={refreshing ? { animation: 'spin 0.9s linear infinite' } : undefined} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>

        {/* Say plainly whether updates are arriving on their own. Without this
            a teacher cannot tell a quiet class from a dropped connection. */}
        <span style={liveStyles.connection}>
          <span style={{
            ...liveStyles.dot,
            background: liveConnected ? 'var(--green)' : 'var(--muted)',
            animation: liveConnected ? 'lm-pulse 1.6s ease-in-out infinite' : 'none',
          }} />
          {liveConnected ? 'Live' : 'Offline — using Refresh'}
        </span>

        {lastRefreshed && (
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.8rem', color: 'var(--muted)' }}>
            Last updated: {lastRefreshed.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
        {Object.entries(STATUS_COLORS).map(([key, val]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem' }}>
            <div style={{ width: '14px', height: '14px', background: val.bg, border: '2px solid var(--ink)' }} />
            {val.label}
          </div>
        ))}
      </div>

      {/* Student rows */}
      {students.length === 0 ? (
        <div className="comic-card" style={{ maxWidth: '500px' }}>
          No students have started this module yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxWidth: '800px' }}>
          {students.map((s) => {
            const status = STATUS_COLORS[s.status] || STATUS_COLORS.not_started;
            // Only counts as live if they are on THIS topic's activity
            const liveRow = live[s.student._id];
            const isLive  = liveRow && liveRow.moduleId === selected;
            return (
              <div key={s.student._id} className="comic-card" style={{ padding: '0.8rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  {/* Avatar + name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: '180px' }}>
                    <div style={{
                      width: '36px', height: '36px',
                      background: 'var(--teal)', border: '2px solid var(--ink)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Fredoka One, cursive', fontSize: '1.1rem', flexShrink: 0,
                    }}>
                      {s.student.fullname[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '0.95rem', letterSpacing: '1px' }}>
                        {s.student.fullname}
                      </div>
                      <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.75rem', color: 'var(--muted)' }}>
                        @{s.student.username}
                      </div>
                    </div>
                  </div>

                  {/* Pushes the score and Detail button to the right */}
                  <div style={{ flex: 1, minWidth: 0 }} />

                  {/* Score.
                      Shows the BEST attempt, which is what the bar draws, what
                      the line below reports and what decides the badge. It used
                      to show the latest instead, so a student who scored 90%
                      and then 50% had a card reading 50% above a bar filled to
                      90% — the mismatch a teacher would notice first. */}
                  <div style={{ textAlign: 'right', minWidth: '80px' }}>
                    {s.bestScore !== null ? (
                      <div style={{
                        fontFamily: 'Fredoka One, cursive',
                        fontSize: '1.2rem',
                        color: s.bestScore >= 75 ? 'var(--green)' : 'var(--red)',
                        letterSpacing: '1px',
                      }}>
                        {s.bestScore}%
                      </div>
                    ) : (
                      <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.8rem', color: 'var(--muted)' }}>No score</div>
                    )}
                    <div style={{
                      background: status.bg,
                      border: '2px solid var(--ink)',
                      padding: '0.1rem 0.5rem',
                      fontFamily: 'Fredoka One, cursive',
                      fontSize: '0.7rem',
                      letterSpacing: '1px',
                      marginTop: '0.2rem',
                    }}>
                      {status.label}
                    </div>

                    {isLive && (
                      <div style={liveStyles.badge}>
                        <span style={liveStyles.dot} /> LIVE
                      </div>
                    )}
                  </div>

                  {/* Detail button */}
                  <button
                    className="btn btn-outline"
                    style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}
                    onClick={() => navigate(`/teacher/monitor/${selected}/student/${s.student._id}`)}
                  >
                    Detail <ArrowRight size={14} />
                  </button>
                </div>

                {/* Progress bar */}
                <div style={{ marginTop: '0.6rem' }}>
                  <div style={{ height: '6px', background: 'var(--paper-dark)', border: '1px solid var(--muted)', position: 'relative' }}>
                    <div style={{
                      height: '100%',
                      width: isLive && liveRow.total
                        ? `${Math.round((liveRow.answered / liveRow.total) * 100)}%`
                        : `${s.bestScore ?? 0}%`,
                      background: isLive ? 'var(--yellow)' : 'var(--teal)',
                      background: 'var(--teal)',
                      transition: 'width 0.3s',
                    }} />
                  </div>
                  <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                    {isLive
                      ? `Answering now — ${liveRow.answered}/${liveRow.total || '?'} done`
                      : s.attempts === 0
                      ? (s.status === 'in_progress' ? 'Opened it — not submitted yet' : 'No attempt yet')
                      : [
                          `Best ${s.bestScore}%`,
                          // Only worth saying when the newest try was not the best one
                          s.latestScore !== s.bestScore ? `latest ${s.latestScore}%` : null,
                          `${s.attempts} attempt${s.attempts !== 1 ? 's' : ''}`,
                          `${s.completedCount}/${s.requiredTotal || 5} sections read`,
                        ].filter(Boolean).join(' • ')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const liveStyles = {
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    marginTop: '0.2rem',
    background: 'var(--yellow)',
    border: '2px solid var(--ink)',
    padding: '0.05rem 0.4rem',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.6rem',
    fontWeight: 700,
    letterSpacing: '0.5px',
  },
  dot: {
    width: '7px',
    height: '7px',
    borderRadius: '999px',
    background: 'var(--red)',
    flexShrink: 0,
    animation: 'lm-pulse 1.6s ease-in-out infinite',
  },
  connection: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.72rem',
    fontWeight: 700,
    color: 'var(--muted-strong)',
  },
};
