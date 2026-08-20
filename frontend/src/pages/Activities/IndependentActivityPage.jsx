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
import SlideDeck from '../../components/comic/SlideDeck.jsx';
import Loader from '../../components/shared/Loader.jsx';

export default function IndependentActivityPage() {
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
      <SectionTitle icon={NotebookPen}>Independent Activity</SectionTitle>
      <div className="comic-card">No activities found for this module.</div>
    </div>
  );

  const total          = activities.length;
  const answeredCount  = Object.keys(localAnswers).length;
  const allAnswered    = answeredCount === total;

  return (
    <div>
      {/* Counter and status ride in the header bar rather than a row of their own */}
      <SectionTitle
        icon={NotebookPen}
        meta={
          <>
            <span className="page-head-count">Question <b>{current + 1}</b> of {total}</span>
            <span className="page-pill">{answeredCount}/{total} answered</span>
            <span className="page-pill teal">GRADED</span>
          </>
        }
      >
        Independent Activity
      </SectionTitle>

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

