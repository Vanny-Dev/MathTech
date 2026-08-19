import React, { useEffect, useState } from 'react';
import { CheckCheck, Check, X, ArrowRight, ArrowLeft } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getCorrectAnswersApi } from '../../api/feedbackApi.js';
import Loader from '../../components/shared/Loader.jsx';

export default function CorrectAnswersPage() {
  const navigate     = useNavigate();
  const submissionId = useSelector((s) => s.submission.submissionId);

  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!submissionId) { setLoading(false); return; }
    getCorrectAnswersApi(submissionId)
      .then(({ data }) => setAnswers(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [submissionId]);

  if (loading) return <Loader text="Loading answers..." />;
  if (!submissionId) return (
    <div>
      <SectionTitle icon={CheckCheck}>Correct Answers</SectionTitle>
      <div className="comic-card">No submission found.
        <button className="btn btn-blue" style={{ marginTop: '0.5rem' }} onClick={() => navigate('/activities/independent')}>Go to Activities</button>
      </div>
    </div>
  );

  return (
    <div>
      <SectionTitle icon={CheckCheck}>Correct Answers</SectionTitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '680px' }}>
        {answers.map((item, i) => (
          <div
            key={item.activityId}
            className="comic-card"
            style={{ borderLeft: `6px solid ${item.isCorrect ? 'var(--green)' : 'var(--red)'}` }}
          >
            {/* Question */}
            <div style={styles.qNum}>Q{i + 1}</div>
            <p style={styles.question}>{item.question}</p>

            {/* Answers */}
            <div style={styles.row}>
              <div style={styles.answerBox('var(--paper-dark)')}>
                <span style={styles.ansLabel}>Your Answer</span>
                <span style={styles.ansVal}>{String(item.givenAnswer ?? '—')}</span>
              </div>
              <div style={styles.answerBox(item.isCorrect ? 'var(--green-soft)' : 'var(--red-soft)')}>
                <span style={styles.ansLabel}>Correct Answer</span>
                <span style={styles.ansVal}>{String(item.correctAnswer)}</span>
              </div>
              <div style={{
                ...styles.badge,
                background: item.isCorrect ? 'var(--green)' : 'var(--red)',
              }}>
                {item.isCorrect ? <Check size={18} strokeWidth={3} /> : <X size={18} strokeWidth={3} />}
              </div>
            </div>

            {/* Points */}
            <div style={styles.points}>
              {item.pointsEarned} / {item.pointsEarned + (item.isCorrect ? 0 : 1)} pts
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <button className="btn btn-outline" onClick={() => navigate('/feedback')}>
          <ArrowLeft size={15} /> Back to Score
        </button>
        <button className="btn btn-blue" onClick={() => navigate('/feedback/explanation')}>
          View Explanations <ArrowRight size={15} />
        </button>
        <button className="btn btn-primary" onClick={() => navigate('/review')}>
          Review Incorrect <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  qNum: {
    fontFamily: 'Fredoka One, cursive',
    fontSize: '0.85rem',
    color: 'var(--muted)',
    marginBottom: '0.2rem',
    letterSpacing: '1px',
  },
  question: {
    fontFamily: 'Nunito, sans-serif',
    fontWeight: 700,
    fontSize: '1rem',
    marginBottom: '0.8rem',
    lineHeight: 1.6,
  },
  row: {
    display: 'flex',
    gap: '0.6rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  answerBox: (bg) => ({
    background: bg,
    border: '2px solid var(--ink)',
    padding: '0.4rem 0.8rem',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '120px',
  }),
  ansLabel: {
    fontFamily: 'Fredoka One, cursive',
    fontSize: '0.7rem',
    letterSpacing: '1px',
    color: 'var(--muted)',
  },
  ansVal: {
    fontFamily: 'Nunito, sans-serif',
    fontWeight: 700,
    fontSize: '1rem',
  },
  badge: {
    width: '32px',
    height: '32px',
    border: '2px solid var(--ink)',
    color: 'var(--white)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Fredoka One, cursive',
    fontSize: '1.1rem',
    flexShrink: 0,
  },
  points: {
    fontFamily: 'Fredoka One, cursive',
    fontSize: '0.8rem',
    color: 'var(--muted)',
    marginTop: '0.5rem',
    letterSpacing: '1px',
  },
};
