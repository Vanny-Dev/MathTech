import React, { useEffect, useState } from 'react';
import { CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import { useNavigate } from 'react-router-dom';
import { getCompletedActivitiesApi } from '../../api/progressApi.js';
import Loader from '../../components/shared/Loader.jsx';

export default function CompletedActivitiesPage() {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    getCompletedActivitiesApi()
      .then(({ data }) => setCompleted(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading completed activities..." />;

  return (
    <div>
      <SectionTitle icon={CheckCircle2} label="Σ done">Completed Activities</SectionTitle>

      {completed.length === 0 ? (
        <div className="comic-card" style={{ maxWidth: '500px' }}>
          <p style={{ fontFamily: 'Nunito, sans-serif' }}>No completed activities yet.</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/activities/independent')}>
            Start Activities <ArrowRight size={15} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxWidth: '640px' }}>
          {completed.map((sub) => (
            <div key={sub._id} className="comic-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {/* Module name */}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1rem', letterSpacing: '1px' }}>
                  {sub.moduleId?.title || 'Unknown Module'}
                </div>
                <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.8rem', color: 'var(--muted)' }}>
                  {sub.moduleId?.subject} • Attempt #{sub.attempt} • {new Date(sub.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Score badge */}
              <div style={{
                background: sub.percentage >= 75 ? 'var(--green)' : 'var(--red)',
                color: 'var(--white)',
                border: '2px solid var(--ink)',
                padding: '0.4rem 0.8rem',
                fontFamily: 'Fredoka One, cursive',
                fontSize: '1.1rem',
                letterSpacing: '1px',
                flexShrink: 0,
              }}>
                {sub.percentage}%
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="btn btn-outline" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/progress')}>
        <ArrowLeft size={15} /> Performance Summary
      </button>
    </div>
  );
}
