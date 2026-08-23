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
import ActivityCompleted from '../../components/shared/ActivityCompleted.jsx';
import AttemptList from '../../components/shared/AttemptList.jsx';
import { getLatestSubmissionApi } from '../../api/feedbackApi.js';
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

  // This student's graded record for the topic: every attempt so far, and
  // whether one of them was perfect — a perfect one closes the activity.
  const [record, setRecord]             = useState(null);

  useEffect(() => {
    dispatch(resetSubmission());
    if (!moduleId) { setLoading(false); return; }

    let cancelled = false;

    // Load the questions and the student's own attempt history together. The
    // history decides whether this page shows the activity or closes it.
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
      // 409 means another tab, or a refresh mid-submit, already recorded this
      // attempt. Show the completed panel rather than a dead button.
      if (err?.response?.status === 409) {
        setRecord({ ...err.response.data, locked: true });
      } else {
        console.error(err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader text="Loading activities..." />;

  // Only a perfect score ends the topic. Anything less leaves it open, with
  // the previous attempts shown so the student can see where they stand.
  if (record?.locked) return (
    <div>
      <SectionTitle icon={NotebookPen}>Independent Activity</SectionTitle>
      <ActivityCompleted result={record} />
    </div>
  );
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
            {record?.attempts ? (
              <span className="page-pill">attempt {record.attempts + 1}</span>
            ) : null}
            <span className="page-pill">{answeredCount}/{total} answered</span>
            <span className="page-pill teal">GRADED</span>
          </>
        }
      >
        Independent Activity
      </SectionTitle>

      {/* Previous attempts, when there are any to show */}
      {record?.history?.length > 0 && (
        <div className="comic-card" style={{ marginBottom: '1rem', padding: '0.7rem 0.8rem' }}>
          <AttemptList history={record.history} />
        </div>
      )}

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

