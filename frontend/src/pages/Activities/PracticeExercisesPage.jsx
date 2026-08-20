import React, { useEffect, useState } from 'react';
import { PencilRuler, ArrowRight, ArrowLeft } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import { useNavigate } from 'react-router-dom';
import { getActivitiesApi } from '../../api/activityApi.js';
import { useWorkbook } from '../../context/WorkbookContext.jsx';
import ComicStrip from '../../components/comic/ComicStrip.jsx';
import SlideDeck from '../../components/comic/SlideDeck.jsx';
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
      <SectionTitle icon={PencilRuler}>Practice Exercises</SectionTitle>
      <div className="comic-card">No practice exercises yet for this module.</div>
      <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/activities/independent')}>
        Go to Independent <ArrowRight size={15} />
      </button>
    </div>
  );

  const total    = activities.length;
  const done     = Object.keys(answered).length === total;

  return (
    <div>
      {/* Counter and status ride in the header bar rather than a row of their own */}
      <SectionTitle
        icon={PencilRuler}
        meta={
          <>
            <span className="page-head-count">Question <b>{current + 1}</b> of {total}</span>
            <span className="page-pill">PRACTICE — unscored</span>
          </>
        }
      >
        Practice Exercises
      </SectionTitle>

      {/* Questions slide the way the lesson pages do */}
      <div>
        <SlideDeck
          count={total}
          index={current}
          onIndexChange={setCurrent}
          instantKey={moduleId}
        >
          {(i) => (
            <ComicStrip
              activity={activities[i]}
              number={i + 1}
              onAnswered={handleAnswered}
            />
          )}
        </SlideDeck>
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

