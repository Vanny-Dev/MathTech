import React, { useEffect, useState } from 'react';
import { User, ArrowLeft, Trophy } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentDetailApi } from '../../api/teacherApi.js';
import Loader from '../../components/shared/Loader.jsx';

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
        {/* Submission history */}
        <div style={{ flex: 1, minWidth: '260px', maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
            <h2 style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1.2rem', letterSpacing: '1px' }}>
              Submission History
            </h2>
            {progress && (
              <span className="formula-chip">
                {progress.attempts} attempt{progress.attempts !== 1 ? 's' : ''}
              </span>
            )}
          </div>

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
