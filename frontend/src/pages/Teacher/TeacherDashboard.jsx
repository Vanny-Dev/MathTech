import React, { useEffect, useState } from 'react';
import { LayoutDashboard, ClipboardList, Users, ArrowRight } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import { useNavigate } from 'react-router-dom';
import { getModulesApi } from '../../api/moduleApi.js';
import { getClassSummaryApi } from '../../api/teacherApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Loader from '../../components/shared/Loader.jsx';

export default function TeacherDashboard() {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [modules, setModules]   = useState([]);
  const [summary, setSummary]   = useState(null);
  const [selected, setSelected] = useState('');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getModulesApi()
      .then(({ data }) => {
        setModules(data);
        if (data.length > 0) setSelected(data[0]._id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    getClassSummaryApi(selected)
      .then(({ data }) => setSummary(data))
      .catch(console.error);
  }, [selected]);

  if (loading) return <Loader text="Loading dashboard..." />;

  return (
    <div>
      <SectionTitle icon={LayoutDashboard} label="Σ class">Teacher Dashboard</SectionTitle>

      {/* Welcome */}
      <div className="comic-card-blue" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1.5rem', letterSpacing: '2px' }}>
          Welcome, {user?.fullname}!
        </h2>
        <p style={{ fontFamily: 'Nunito, sans-serif', marginTop: '0.3rem' }}>
          Monitor your students' progress in real-time.
        </p>
      </div>

      {/* Module selector */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <label style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1rem', letterSpacing: '1px' }}>Module:</label>
        <select
          className="comic-input"
          style={{ maxWidth: '320px' }}
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {modules.map((m) => (
            <option key={m._id} value={m._id}>{m.title}</option>
          ))}
        </select>
      </div>

      {/* Stats grid */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', maxWidth: '720px', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Students', value: summary.totalStudents,    color: 'var(--white)' },
            { label: 'Started',        value: summary.started,          color: 'var(--teal)' },
            { label: 'Not Started',    value: summary.notStarted,       color: 'var(--red)' },
            { label: 'Completed',      value: summary.completed,        color: 'var(--green)' },
            { label: 'In Progress',    value: summary.inProgress,       color: 'var(--yellow)' },
            { label: 'Avg Score',      value: `${summary.scores.average}%`, color: 'var(--white)' },
          ].map((s) => (
            <div key={s.label} className="comic-card" style={{ background: s.color, textAlign: 'center' }}>
              <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '2rem' }}>{s.value}</div>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.8rem', color: 'var(--muted-strong)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => navigate(`/teacher/monitor?moduleId=${selected}`)}>
          <ClipboardList size={16} /> Monitor Students <ArrowRight size={15} />
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/teacher/students')}>
          <Users size={16} /> All Students <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
