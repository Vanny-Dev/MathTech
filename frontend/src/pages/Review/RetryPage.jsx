import React, { useEffect, useState } from 'react';
import { RotateCcw, Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getActivitiesApi, submitAnswersApi } from '../../api/activityApi.js';
import { useWorkbook } from '../../context/WorkbookContext.jsx';
import { setSubmissionResult, resetSubmission } from '../../store/submissionSlice.js';
import ComicStrip from '../../components/comic/ComicStrip.jsx';
import ActivityCompleted from '../../components/shared/ActivityCompleted.jsx';
import AttemptList from '../../components/shared/AttemptList.jsx';
import { getLatestSubmissionApi } from '../../api/feedbackApi.js';
import SlideDeck from '../../components/comic/SlideDeck.jsx';
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
  const [record, setRecord]             = useState(null);

  useEffect(() => {
    dispatch(resetSubmission());
    if (!moduleId) { setLoading(false); return; }

    let cancelled = false;

    // Retry posts the same graded set as the activity itself, so it follows the
    // same rule: open until the student has answered it perfectly.
    Promise.all([
      getLatestSubmissionApi(moduleId).then(({ data }) => data).catch(() => null),
      getActivitiesApi(moduleId, false).then(({ data }) => data).catch(() => []),
    ])
      .then(([submission, list]) => {
        if (cancelled) return;
        setRecord(submission);
        setActivities(list);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
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

  if (record?.locked) return (
    <div>
      <SectionTitle icon={RotateCcw}>Retry Activities</SectionTitle>
      <ActivityCompleted result={record} />
    </div>
  );

  const activity      = activities[current];
  const total         = activities.length;
  const answeredCount = Object.keys(localAnswers).length;
  const allAnswered   = answeredCount === total;

  return (
    <div>
      <SectionTitle
        icon={RotateCcw}
        meta={
          <>
            <span className="page-head-count">Question <b>{current + 1}</b> of {total}</span>
            <span className="page-pill">{answeredCount}/{total} answered</span>
          </>
        }
      >
        Retry Activities
      </SectionTitle>

      <div style={{
        background: 'var(--yellow)',
        border: '3px solid var(--ink)',
        padding: '0.6rem 1rem',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 700,
        marginBottom: '1rem',
        maxWidth: '640px', marginInline: 'auto',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><Zap size={16} strokeWidth={2.5} /> This is a new attempt — all questions will be graded fresh.</span>
      </div>


      {/* Answer dots */}
      <div className="q-dots">
        {activities.map((a, i) => (
          <button
            key={a._id}
            type="button"
            className={`q-dot ${localAnswers[a._id] !== undefined ? 'answered' : ''} ${i === current ? 'on' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to question ${i + 1}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Questions slide the way the lesson pages do */}
      <div>
        <SlideDeck count={total} index={current} onIndexChange={setCurrent}>
          {(i) => (
            <ComicStrip
              activity={activities[i]}
              number={i + 1}
              onAnswered={handleAnswered}
            />
          )}
        </SlideDeck>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <button className="btn btn-outline" disabled={current === 0} onClick={() => setCurrent(current - 1)}><ArrowLeft size={15} /> Prev</button>
        {current < total - 1 && (
          <button className="btn btn-blue" onClick={() => setCurrent(current + 1)}>Next <ArrowRight size={15} /></button>
        )}
        {allAnswered && (
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting} style={{ marginLeft: 'auto' }}>
            {submitting ? 'Submitting...' : <>SUBMIT RETRY <ArrowRight size={15} /></>}
          </button>
        )}
      </div>
    </div>
  );
}
