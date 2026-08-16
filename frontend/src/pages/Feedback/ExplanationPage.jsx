import React, { useEffect, useState } from 'react';
import { Lightbulb, CircleCheckBig, ArrowRight, ArrowLeft } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getCorrectAnswersApi } from '../../api/feedbackApi.js';
import Loader from '../../components/shared/Loader.jsx';

export default function ExplanationPage() {
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

  if (loading) return <Loader text="Loading explanations..." />;

  return (
    <div>
      <SectionTitle icon={Lightbulb} label="// why">Explanation / Solution</SectionTitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '680px' }}>
        {answers.map((item, i) => (
          <div key={item.activityId} className="comic-card">
            {/* Question */}
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
              <div style={{
                background: item.isCorrect ? 'var(--green)' : 'var(--red)',
                color: 'var(--white)',
                border: '2px solid var(--ink)',
                padding: '0.2rem 0.6rem',
                fontFamily: 'Fredoka One, cursive',
                fontSize: '0.9rem',
                flexShrink: 0,
              }}>
                Q{i + 1}
              </div>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, lineHeight: 1.6 }}>
                {item.question}
              </p>
            </div>

            {/* Correct answer highlight */}
            <div style={{
              background: 'var(--yellow)',
              border: '2px solid var(--ink)',
              padding: '0.5rem 0.8rem',
              marginBottom: '0.8rem',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><CircleCheckBig size={16} strokeWidth={2.5} /> Correct Answer:</span>{' '}<span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{String(item.correctAnswer)}</span>
            </div>

            {/* Explanation */}
            <div style={{
              background: 'var(--paper-dark)',
              border: '2px dashed var(--muted)',
              padding: '0.8rem',
              fontFamily: 'Nunito, sans-serif',
              lineHeight: 1.8,
              fontSize: '0.95rem',
            }}>
              {item.explanation || 'No explanation provided for this item.'}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <button className="btn btn-outline" onClick={() => navigate('/feedback/answers')}>
          <ArrowLeft size={15} /> Correct Answers
        </button>
        <button className="btn btn-primary" onClick={() => navigate('/review')}>
          Review Incorrect <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
