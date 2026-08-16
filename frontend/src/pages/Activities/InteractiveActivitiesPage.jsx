import React, { useEffect, useState } from 'react';
import { NotebookPen, ArrowRight, ArrowLeft } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getActivitiesApi, submitAnswersApi } from '../../api/activityApi.js';
import { useWorkbook } from '../../context/WorkbookContext.jsx';
import { setAnswer, setSubmissionResult, resetSubmission } from '../../store/submissionSlice.js';
import { markSection } from '../../store/workbookSlice.js';
import ComicStrip from '../../components/comic/ComicStrip.jsx';
import Loader from '../../components/shared/Loader.jsx';

export default function InteractiveActivitiesPage() {
  const { moduleId, markComplete } = useWorkbook();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const answers   = useSelector((s) => s.submission.answers);

  const [activities, setActivities] = useState([]);
  const [current, setCurrent]       = useState(0);
  const [localAnswers, setLocalAnswers] = useState({});
  const [submitting, setSubmitting]     = useState(false);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    dispatch(resetSubmission());
    if (!moduleId) { setLoading(false); return; }
    getActivitiesApi(moduleId, false)
      .then(({ data }) => setActivities(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [moduleId]);

  const handleAnswered = (activityId, givenAnswer) => {
    setLocalAnswers((prev) => ({ ...prev, [activityId]: givenAnswer }));
    dispatch(setAnswer({ activityId, answer: givenAnswer }));
    return null; // correctness revealed after full submit
  };

  const handleSubmitAll = async () => {
    setSubmitting(true);
    try {
      const payload = {
        moduleId,
        isPractice: false,
        answers: Object.entries(localAnswers).map(([activityId, givenAnswer]) => ({
          activityId,
          givenAnswer,
        })),
      };
      const { data } = await submitAnswersApi(payload);
      dispatch(setSubmissionResult(data));
      dispatch(markSection('activities'));
      markComplete('activities');
      navigate('/feedback');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader text="Loading activities..." />;
  if (activities.length === 0) return (
    <div>
      <SectionTitle icon={NotebookPen} label="Q₁..Qₙ">Interactive Activities</SectionTitle>
      <div className="comic-card">No activities found for this module.</div>
    </div>
  );

  const activity       = activities[current];
  const total          = activities.length;
  const answeredCount  = Object.keys(localAnswers).length;
  const allAnswered    = answeredCount === total;

  return (
    <div>
      <SectionTitle icon={NotebookPen} label="Q₁..Qₙ">Interactive Activities</SectionTitle>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={styles.counter}>
          Question <span style={{ color: 'var(--teal)' }}>{current + 1}</span> of {total}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={styles.pill}>
            {answeredCount}/{total} answered
          </div>
          <div style={{ ...styles.pill, background: 'var(--teal)' }}>GRADED</div>
        </div>
      </div>

      {/* Answer dots */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {activities.map((a, i) => (
          <button
            key={a._id}
            onClick={() => setCurrent(i)}
            style={{
              width: '32px', height: '32px',
              border: '2px solid var(--ink)',
              background: localAnswers[a._id] !== undefined
                ? 'var(--yellow)'
                : i === current ? 'var(--teal)' : 'var(--white)',
              fontFamily: 'Fredoka One, cursive',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Comic strip */}
      <div style={{ maxWidth: '640px' }}>
        <ComicStrip
          key={activity._id}
          activity={activity}
          onAnswered={handleAnswered}
        />
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <button className="btn btn-outline" disabled={current === 0} onClick={() => setCurrent(current - 1)}>
          <ArrowLeft size={15} /> Prev
        </button>
        {current < total - 1 ? (
          <button className="btn btn-blue" onClick={() => setCurrent(current + 1)}>
            Next <ArrowRight size={15} />
          </button>
        ) : null}
        {allAnswered && (
          <button
            className="btn btn-primary"
            onClick={handleSubmitAll}
            disabled={submitting}
            style={{ marginLeft: 'auto' }}
          >
            {submitting ? 'Submitting...' : <>SUBMIT ALL ANSWERS <ArrowRight size={16} /></>}
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
