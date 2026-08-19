import React, { useEffect, useState } from 'react';
import { SearchX, PartyPopper, Check, Lightbulb, RotateCcw, ArrowRight } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useWorkbook } from '../../context/WorkbookContext.jsx';
import { getIncorrectAnswersApi } from '../../api/feedbackApi.js';
import { markSectionCompleteApi } from '../../api/progressApi.js';
import { markSection } from '../../store/workbookSlice.js';
import { useDispatch } from 'react-redux';
import Loader from '../../components/shared/Loader.jsx';

export default function ReviewIncorrectPage() {
  const navigate     = useNavigate();
  const dispatch     = useDispatch();
  const submissionId = useSelector((s) => s.submission.submissionId);
  const { moduleId, markComplete } = useWorkbook();

  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!submissionId) { setLoading(false); return; }
    getIncorrectAnswersApi(submissionId)
      .then(({ data }) => {
        setItems(data);
        // Mark review complete
        if (moduleId) {
          markSectionCompleteApi(moduleId, 'review').catch(() => {});
          dispatch(markSection('review'));
          markComplete('review');
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [submissionId]);

  if (loading) return <Loader text="Loading review..." />;

  return (
    <div>
      <SectionTitle icon={SearchX}>Review Incorrect Answers</SectionTitle>

      {items.length === 0 ? (
        <div className="comic-card-blue" style={{ maxWidth: '500px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Fredoka One, cursive', fontSize: '1.5rem' }}>
            <PartyPopper size={24} strokeWidth={2.5} /> PERFECT SCORE!
          </div>
          <p style={{ fontFamily: 'Nunito, sans-serif', marginTop: '0.5rem' }}>
            You got everything correct! Nothing to review.
          </p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/progress')}>
            View Progress <ArrowRight size={15} />
          </button>
        </div>
      ) : (
        <>
          <div style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            marginBottom: '1rem',
            color: 'var(--red)',
          }}>
            {items.length} item{items.length > 1 ? 's' : ''} to review
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '680px' }}>
            {items.map((item, i) => (
              <div key={item.activityId} className="comic-card" style={{ borderLeft: '6px solid var(--red)' }}>
                {/* Question */}
                <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '0.8rem', color: 'var(--muted)', letterSpacing: '1px', marginBottom: '0.3rem' }}>
                  ITEM {i + 1} — {item.type?.replace('_', ' ').toUpperCase()}
                </div>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, lineHeight: 1.6, marginBottom: '0.8rem' }}>
                  {item.question}
                </p>

                {/* Choices (MCQ) */}
                {item.choices?.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.8rem' }}>
                    {item.choices.map((c, ci) => (
                      <div key={ci} style={{
                        padding: '0.4rem 0.8rem',
                        border: '2px solid var(--ink)',
                        background: String(c) === String(item.correctAnswer) ? 'var(--green-soft)' : 'var(--white)',
                        fontFamily: 'Nunito, sans-serif',
                        fontWeight: String(c) === String(item.correctAnswer) ? 700 : 400,
                      }}>
                        {String.fromCharCode(65 + ci)}. {c}
                        {String(c) === String(item.correctAnswer) && <Check size={15} strokeWidth={3} style={{ verticalAlign: 'text-bottom', marginLeft: '0.3rem' }} />}
                      </div>
                    ))}
                  </div>
                )}

                {/* Your answer vs correct */}
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <div style={{ background: 'var(--red-soft)', border: '2px solid var(--ink)', padding: '0.4rem 0.8rem' }}>
                    <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '1px' }}>YOUR ANSWER</div>
                    <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>{String(item.givenAnswer ?? '—')}</div>
                  </div>
                  <div style={{ background: 'var(--green-soft)', border: '2px solid var(--ink)', padding: '0.4rem 0.8rem' }}>
                    <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '1px' }}>CORRECT ANSWER</div>
                    <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>{String(item.correctAnswer)}</div>
                  </div>
                </div>

                {/* Explanation */}
                {item.explanation && (
                  <div style={{
                    marginTop: '0.8rem',
                    background: 'var(--paper-dark)',
                    border: '2px dashed var(--muted)',
                    padding: '0.6rem 0.8rem',
                    fontFamily: 'Nunito, sans-serif',
                    lineHeight: 1.7,
                    fontSize: '0.9rem',
                  }}>
                    <span style={{ display: 'flex', gap: '0.45rem' }}><Lightbulb size={16} strokeWidth={2.5} style={{ flexShrink: 0, marginTop: '2px' }} />{item.explanation}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-yellow" onClick={() => navigate('/review/retry')}>
              <RotateCcw size={16} /> Retry Activities
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/progress')}>
              View Progress <ArrowRight size={15} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
