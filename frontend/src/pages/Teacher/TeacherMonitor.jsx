import React, { useEffect, useState, useCallback } from 'react';
import { Activity, RefreshCw, ArrowRight } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import { SECTION_KEYS, SECTION_ICONS } from '../../components/shared/sectionIcons.js';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getModulesApi } from '../../api/moduleApi.js';
import { getModuleProgressApi } from '../../api/teacherApi.js';
import Loader from '../../components/shared/Loader.jsx';

const SECTIONS = SECTION_KEYS;

const STATUS_COLORS = {
  completed:   { bg: 'var(--green)', label: 'Completed' },
  in_progress: { bg: 'var(--yellow)', label: 'In Progress' },
  not_started: { bg: 'var(--paper-dark)',    label: 'Not Started' },
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

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => fetchProgress(true), 30000);
    return () => clearInterval(interval);
  }, [fetchProgress]);

  if (loading) return <Loader text="Loading student progress..." />;

  return (
    <div>
      <SectionTitle icon={Activity} label="live">Student Monitor</SectionTitle>

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

                  {/* Section dots */}
                  <div style={{ display: 'flex', gap: '0.3rem', flex: 1, flexWrap: 'wrap' }}>
                    {SECTIONS.map((sec) => {
                      const SecIcon = SECTION_ICONS[sec];
                      const done = s.completedSections[sec];
                      return (
                        <div
                          key={sec}
                          title={sec}
                          style={{
                            width: '28px', height: '28px',
                            background: done ? 'var(--green)' : 'var(--paper-dark)',
                            color: done ? 'var(--ink)' : 'var(--muted)',
                            border: '2px solid var(--ink)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <SecIcon size={14} strokeWidth={2.5} />
                        </div>
                      );
                    })}
                  </div>

                  {/* Score */}
                  <div style={{ textAlign: 'right', minWidth: '80px' }}>
                    {s.latestScore !== null ? (
                      <div style={{
                        fontFamily: 'Fredoka One, cursive',
                        fontSize: '1.2rem',
                        color: s.latestScore >= 75 ? 'var(--green)' : 'var(--red)',
                        letterSpacing: '1px',
                      }}>
                        {s.latestScore}%
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
                      width: `${(s.completedCount / 7) * 100}%`,
                      background: 'var(--teal)',
                      transition: 'width 0.3s',
                    }} />
                  </div>
                  <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                    {s.completedCount}/7 sections • {s.attempts} attempt{s.attempts !== 1 ? 's' : ''}
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
