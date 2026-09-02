import React, { useEffect, useState } from 'react';
import { Percent, PartyPopper, Flame, ArrowRight } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useWorkbook } from '../../context/WorkbookContext.jsx';
import { markSectionCompleteApi } from '../../api/progressApi.js';
import { getLatestSubmissionApi } from '../../api/feedbackApi.js';
import { setSubmissionResult } from '../../store/submissionSlice.js';
import Loader from '../../components/shared/Loader.jsx';
import AdContainer from '../../components/ads/AdContainer.jsx';
import { useAds } from '../../hooks/useAds.js';

export default function ViewScorePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const stored   = useSelector((s) => s.submission.result);
  const { moduleId, markComplete } = useWorkbook();

  const [result, setResult]   = useState(stored);
  const [loading, setLoading] = useState(!stored);
  const { notifyEligibleAction } = useAds();

  // Redux is memory. One refresh and the score the student had just earned was
  // gone, leaving "No submission found" and no way to finish this section.
  // Fall back to their own latest graded attempt on the server.
  useEffect(() => {
    if (stored) { setResult(stored); setLoading(false); return; }
    if (!moduleId) { setLoading(false); return; }

    let cancelled = false;
    getLatestSubmissionApi(moduleId)
      .then(({ data }) => {
        if (cancelled) return;
        setResult(data);
        dispatch(setSubmissionResult(data));   // restore it for the pages after this one
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [stored, moduleId, dispatch]);

  // Seeing the score is what finishes this section. It used to be marked only
  // when the student clicked through to the answers, so anyone who left by the
  // sidebar stayed one section short of completion.
  useEffect(() => {
    if (!result || !moduleId) return;
    markSectionCompleteApi(moduleId, 'feedback')
      .then(() => markComplete('feedback'))
      .catch(() => {});
    // Finishing a graded activity is a meaningful break point — one of the
    // "eligible actions" the developer's EVERY_ELIGIBLE_ACTION mode is
    // allowed to react to. A no-op in normal/frequent mode.
    notifyEligibleAction('activity_scored');
  }, [result, moduleId, markComplete, notifyEligibleAction]);

  const handleNext = () => navigate('/feedback/answers');

  if (loading) return <Loader text="Loading your score..." />;

  if (!result) return (
    <div>
      <SectionTitle icon={Percent}>Score</SectionTitle>
      <div className="comic-card">
        No submission found.{' '}
        <button className="btn btn-blue" style={{ marginTop: '0.5rem' }} onClick={() => navigate('/activities/independent')}>
          Go to Activities
        </button>
      </div>
    </div>
  );

  const { totalScore, maxScore, percentage, attempt } = result;
  const passed = percentage >= 75;

  // Score ring via SVG
  const radius      = 52;
  const circumference = 2 * Math.PI * radius;
  const dash        = (percentage / 100) * circumference;

  return (
    <div>
      <SectionTitle icon={Percent}>Your Score</SectionTitle>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Score ring */}
        <div className="comic-card" style={{ textAlign: 'center', minWidth: '180px' }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            {/* var() is not resolved in SVG presentation attributes — use style */}
            <circle cx="60" cy="60" r={radius} strokeWidth="10"
              style={{ fill: 'none', stroke: 'var(--paper-dark)' }} />
            <circle
              cx="60" cy="60" r={radius}
              strokeWidth="10"
              strokeDasharray={`${dash} ${circumference}`}
              strokeLinecap="butt"
              transform="rotate(-90 60 60)"
              style={{ fill: 'none', stroke: passed ? 'var(--green)' : 'var(--red)' }}
            />
            <text x="60" y="65" textAnchor="middle" fontSize="22"
              style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fill: 'var(--ink)' }}>
              {percentage}%
            </text>
          </svg>
          <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1.1rem', marginTop: '0.5rem' }}>
            {totalScore} / {maxScore} pts
          </div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.8rem', color: 'var(--muted)' }}>
            Attempt #{attempt}
          </div>
        </div>

        {/* Result panel */}
        <div
          className="comic-card"
          style={{
            flex: 1,
            background: passed ? 'var(--green)' : 'var(--red)',
            color: 'var(--white)',
            minWidth: '200px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Fredoka One, cursive', fontSize: '1.8rem' }}>
            {passed
              ? <><PartyPopper size={28} strokeWidth={2.5} /> PASSED!</>
              : <><Flame size={28} strokeWidth={2.5} /> KEEP TRYING!</>}
          </div>
          <p style={{ fontFamily: 'Nunito, sans-serif', marginTop: '0.5rem', fontWeight: 700 }}>
            {passed
              ? 'Great job! You scored above 75%. Proceed to review your answers.'
              : 'You scored below 75%. Review your answers and try again!'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <button className="btn btn-outline" onClick={handleNext}>
          View Correct Answers <ArrowRight size={15} />
        </button>
        <button className="btn btn-blue" onClick={() => navigate('/feedback/explanation')}>
          View Explanations <ArrowRight size={15} />
        </button>
        {!passed && (
          <button className="btn btn-primary" onClick={() => navigate('/review/retry')}>
            Retry <ArrowRight size={15} />
          </button>
        )}
      </div>

      <AdContainer placement="betweenContent" trigger="eligible-action" style={{ marginTop: '1.5rem' }} />
    </div>
  );
}
