import React, { useEffect, useState } from 'react';
import { RotateCcw, Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getActivitiesApi, submitAnswersApi } from '../../api/activityApi.js';
import { useWorkbook } from '../../context/WorkbookContext.jsx';
import { setSubmissionResult, resetSubmission } from '../../store/submissionSlice.js';
import ComicStrip from '../../components/comic/ComicStrip.jsx';
import Loader from '../../components/shared/Loader.jsx';

export default function RetryPage() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { moduleId } = useWorkbook();

  const [activities, setActivities]     = useState([]);
  const [localAnswers, setLocalAnswers] = useState({});
  const [current, setCurrent]           = useState(0);
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
    return null;
  };

  const handleSubmit = async () => {
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
      navigate('/feedback');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader text="Loading retry..." />;

  const activity      = activities[current];
  const total         = activities.length;
  const answeredCount = Object.keys(localAnswers).length;
  const allAnswered   = answeredCount === total;

  return (
    <div>
      <SectionTitle icon={RotateCcw}>Retry Activities</SectionTitle>

      <div style={{
        background: 'var(--yellow)',
        border: '3px solid var(--ink)',
        padding: '0.6rem 1rem',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 700,
        marginBottom: '1rem',
        maxWidth: '640px',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><Zap size={16} strokeWidth={2.5} /> This is a new attempt — all questions will be graded fresh.</span>
      </div>

      {/* Counter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', maxWidth: '640px' }}>
        <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1.1rem', letterSpacing: '1px' }}>
          Question <span style={{ color: 'var(--teal)' }}>{current + 1}</span> of {total}
        </div>
        <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '0.9rem', color: 'var(--muted)' }}>
          {answeredCount}/{total} answered
        </div>
      </div>

      {/* Answer dots */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {activities.map((a, i) => (
          <button key={a._id} onClick={() => setCurrent(i)} style={{
            width: '32px', height: '32px',
            border: '2px solid var(--ink)',
            background: localAnswers[a._id] !== undefined ? 'var(--yellow)' : i === current ? 'var(--teal)' : 'var(--white)',
            fontFamily: 'Fredoka One, cursive', fontSize: '0.85rem', cursor: 'pointer',
          }}>
            {i + 1}
          </button>
        ))}
      </div>

      {/* Comic strip */}
      {activity && (
        <div style={{ maxWidth: '640px' }}>
          <ComicStrip key={`retry-${activity._id}`} activity={activity} onAnswered={handleAnswered} />
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <button className="btn btn-outline" disabled={current === 0} onClick={() => setCurrent(current - 1)}><ArrowLeft size={15} /> Prev</button>
        {current < total - 1 && (
          <button className="btn btn-blue" onClick={() => setCurrent(current + 1)}>Next <ArrowRight size={15} /></button>
        )}
        {allAnswered && (
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting} style={{ marginLeft: 'auto' }}>
            {submitting ? 'Submitting...' : 'SUBMIT RETRY <ArrowRight size={15} />'}
          </button>
        )}
      </div>
    </div>
  );
}
