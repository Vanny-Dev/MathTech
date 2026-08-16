import React, { useEffect, useState } from 'react';
import { User, ArrowLeft, Check, Circle, Trophy } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import { SECTION_META } from '../../components/shared/sectionIcons.js';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentDetailApi } from '../../api/teacherApi.js';
import Loader from '../../components/shared/Loader.jsx';

const SECTIONS = SECTION_META;

export default function StudentDetail() {
  const { moduleId, studentId } = useParams();
  const navigate = useNavigate();

  const [detail, setDetail]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentDetailApi(moduleId, studentId)
      .then(({ data }) => setDetail(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [moduleId, studentId]);

  if (loading) return <Loader text="Loading student detail..." />;
  if (!detail) return <div className="comic-card">Student not found.</div>;

  const { student, progress, submissions } = detail;
  const best = submissions.reduce((max, s) => (s.percentage > (max?.percentage || 0) ? s : max), null);

  return (
    <div>
      <button className="btn btn-outline" style={{ marginBottom: '1rem' }} onClick={() => navigate(-1)}>
        <ArrowLeft size={15} /> Back
      </button>

      <SectionTitle icon={User} label="id">{student.fullname}</SectionTitle>

      {/* Student info card */}
      <div className="comic-card-blue" style={{ maxWidth: '500px', marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1.3rem', letterSpacing: '2px' }}>
          @{student.username}
        </div>
        <div style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--board-light)', marginTop: '0.2rem' }}>
          {student.email}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Section progress */}
        <div style={{ flex: 1, minWidth: '260px' }}>
          <h2 style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1.2rem', letterSpacing: '1px', marginBottom: '0.8rem' }}>
            Section Progress
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {SECTIONS.map((sec) => {
              const done = progress?.completedSections?.[sec.key];
              const SecIcon = sec.icon;
              return (
                <div key={sec.key} style={{
                  display: 'flex', alignItems: 'center', gap: '0.8rem',
                  padding: '0.5rem 0.8rem',
                  background: done ? 'var(--green-soft)' : 'var(--paper-dark)',
                  border: '2px solid var(--ink)',
                }}>
                  <SecIcon size={17} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, flex: 1 }}>{sec.label}</span>
                  <span className="formula-chip">{sec.math}</span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: done ? 'var(--green)' : 'var(--muted)',
                  }}>
                    {done ? <Check size={13} strokeWidth={3} /> : <Circle size={13} />}
                    {done ? 'Done' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
          {progress && (
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
              Last visited: <strong>{progress.lastVisited}</strong> • {progress.attempts} attempt{progress.attempts !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Submission history */}
        <div style={{ flex: 1, minWidth: '260px' }}>
          <h2 style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1.2rem', letterSpacing: '1px', marginBottom: '0.8rem' }}>
            Submission History
          </h2>

          {best && (
            <div className="comic-card" style={{ background: 'var(--yellow)', marginBottom: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'Fredoka One, cursive', fontSize: '1rem' }}>
                <Trophy size={17} strokeWidth={2.5} /> Best Score
              </div>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '1.4rem' }}>{best.percentage}%</div>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.8rem', color: 'var(--muted-strong)' }}>
                {best.totalScore}/{best.maxScore} pts • Attempt #{best.attempt}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {submissions.length === 0 ? (
              <div className="comic-card" style={{ color: 'var(--muted)', fontFamily: 'Nunito, sans-serif' }}>No submissions yet.</div>
            ) : (
              submissions.map((sub) => (
                <div key={sub.submissionId} style={{
                  display: 'flex', alignItems: 'center', gap: '0.8rem',
                  padding: '0.5rem 0.8rem',
                  background: 'var(--white)',
                  border: '2px solid var(--ink)',
                }}>
                  <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '0.9rem', color: 'var(--muted)', flexShrink: 0 }}>
                    #{sub.attempt}
                  </div>
                  <div style={{ flex: 1, fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem' }}>
                    {sub.totalScore}/{sub.maxScore} pts
                  </div>
                  <div style={{
                    fontFamily: 'Fredoka One, cursive',
                    fontSize: '1rem',
                    color: sub.percentage >= 75 ? 'var(--green)' : 'var(--red)',
                    letterSpacing: '1px',
                  }}>
                    {sub.percentage}%
                  </div>
                  <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.75rem', color: 'var(--muted)', flexShrink: 0 }}>
                    {new Date(sub.submittedAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
