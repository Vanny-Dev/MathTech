import React, { useEffect, useState } from 'react';
import { PencilRuler, ArrowRight, ArrowLeft } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import { useNavigate } from 'react-router-dom';
import { getActivitiesApi } from '../../api/activityApi.js';
import { useWorkbook } from '../../context/WorkbookContext.jsx';
import ComicStrip from '../../components/comic/ComicStrip.jsx';
import Loader from '../../components/shared/Loader.jsx';

export default function PracticeExercisesPage() {
  const { moduleId } = useWorkbook();
  const navigate     = useNavigate();

  const [activities, setActivities] = useState([]);
  const [current, setCurrent]       = useState(0);
  const [answered, setAnswered]     = useState({});
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (!moduleId) { setLoading(false); return; }
    getActivitiesApi(moduleId, true)
      .then(({ data }) => setActivities(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [moduleId]);

  const handleAnswered = (activityId, givenAnswer) => {
    setAnswered((prev) => ({ ...prev, [activityId]: givenAnswer }));
    return null; // practice — no grading shown
  };

  if (loading) return <Loader text="Loading practice..." />;
  if (activities.length === 0) return (
    <div>
      <SectionTitle icon={PencilRuler} label="practice[]">Practice Exercises</SectionTitle>
      <div className="comic-card">No practice exercises yet for this module.</div>
      <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/activities/independent')}>
        Go to Independent <ArrowRight size={15} />
      </button>
    </div>
  );

  const activity = activities[current];
  const total    = activities.length;
  const done     = Object.keys(answered).length === total;

  return (
    <div>
      <SectionTitle icon={PencilRuler} label="practice[]">Practice Exercises</SectionTitle>

      {/* Counter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={styles.counter}>
          Question <span style={{ color: 'var(--teal)' }}>{current + 1}</span> of {total}
        </div>
        <div style={styles.pill}>PRACTICE — unscored</div>
      </div>

      {/* Comic strip */}
      <div style={{ maxWidth: '640px' }}>
        <ComicStrip
          key={activity._id}
          activity={activity}
          onAnswered={handleAnswered}
        />
      </div>

      {/* Prev / Next */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button className="btn btn-outline" disabled={current === 0} onClick={() => setCurrent(current - 1)}>
          <ArrowLeft size={15} /> Prev
        </button>
        {current < total - 1 ? (
          <button className="btn btn-blue" onClick={() => setCurrent(current + 1)}>
            Next <ArrowRight size={15} />
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => navigate('/activities/independent')}>
            Go to Graded Activities <ArrowRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  counter: {
    fontFamily: 'Fredoka One, cursive',
    fontSize: '1.1rem',
    letterSpacing: '1px',
  },
  pill: {
    background: 'var(--yellow)',
    border: '2px solid var(--ink)',
    padding: '0.2rem 0.8rem',
    fontFamily: 'Fredoka One, cursive',
    fontSize: '0.85rem',
    letterSpacing: '1px',
  },
};
