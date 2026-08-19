import React, { useEffect, useState } from 'react';
import { BarChart3, Trophy, ArrowRight } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useWorkbook } from '../../context/WorkbookContext.jsx';
import { getPerformanceSummaryApi } from '../../api/progressApi.js';
import { markSection } from '../../store/workbookSlice.js';
import Loader from '../../components/shared/Loader.jsx';

export default function PerformanceSummaryPage() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { moduleId, markComplete } = useWorkbook();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!moduleId) { setLoading(false); return; }
    getPerformanceSummaryApi(moduleId)
      .then(({ data }) => {
        setSummary(data);
        dispatch(markSection('progress'));
        markComplete('progress');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [moduleId]);

  if (loading) return <Loader text="Loading performance..." />;

  const { summary: attempts = [], best = {}, totalAttempts = 0 } = summary || {};

  return (
    <div>
      <SectionTitle icon={BarChart3}>Performance Summary</SectionTitle>

      {/* Best score banner */}
      {best?.percentage !== undefined && (
        <div className="comic-card-blue" style={{ maxWidth: '640px', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Fredoka One, cursive', fontSize: '1.6rem' }}>
            <Trophy size={26} strokeWidth={2.5} /> BEST SCORE: <span className="mono">{best.percentage}%</span>
          </div>
          <div style={{ fontFamily: 'Nunito, sans-serif', marginTop: '0.3rem' }}>
            {best.totalScore} / {best.maxScore} pts — Attempt #{best.attempt}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', maxWidth: '640px' }}>
        {[
          { label: 'Total Attempts', value: totalAttempts, color: 'var(--teal)' },
          { label: 'Best Score',     value: `${best?.percentage ?? 0}%`, color: 'var(--yellow)' },
          { label: 'Latest Score',   value: attempts.length ? `${attempts[attempts.length - 1].percentage}%` : '—', color: 'var(--white)' },
        ].map((s) => (
          <div key={s.label} className="comic-card" style={{ flex: 1, minWidth: '130px', background: s.color, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1.6rem', letterSpacing: '1px' }}>{s.value}</div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.8rem', color: 'var(--muted-strong)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Attempt history table */}
      <div className="comic-card" style={{ maxWidth: '640px', padding: 0, overflow: 'hidden' }}>
        <div style={{
          background: 'var(--ink)', color: 'var(--white)',
          padding: '0.6rem 1rem',
          fontFamily: 'Fredoka One, cursive',
          fontSize: '1rem',
          letterSpacing: '1px',
        }}>
          Attempt History
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Nunito, sans-serif' }}>
          <thead>
            <tr style={{ background: 'var(--paper)', borderBottom: '2px solid var(--ink)' }}>
              {['Attempt', 'Score', 'Percentage', 'Date'].map((h) => (
                <th key={h} style={{ padding: '0.5rem 0.8rem', textAlign: 'left', fontFamily: 'Fredoka One, cursive', letterSpacing: '1px', fontSize: '0.9rem' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attempts.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '1rem', color: 'var(--muted)', textAlign: 'center' }}>No attempts yet</td></tr>
            ) : (
              attempts.map((a, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--paper-dark)', background: a.percentage === best?.percentage ? 'var(--yellow-soft)' : 'var(--white)' }}>
                  <td style={{ padding: '0.5rem 0.8rem' }}>#{a.attempt}</td>
                  <td style={{ padding: '0.5rem 0.8rem' }}>{a.totalScore}/{a.maxScore}</td>
                  <td style={{ padding: '0.5rem 0.8rem' }}>
                    <span style={{
                      background: a.percentage >= 75 ? 'var(--green-soft)' : 'var(--red-soft)',
                      border: '2px solid var(--ink)',
                      padding: '0.1rem 0.5rem',
                      fontWeight: 700,
                    }}>
                      {a.percentage}%
                    </span>
                  </td>
                  <td style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
                    {new Date(a.submittedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <button className="btn btn-outline" onClick={() => navigate('/progress/completed')}>Completed Activities <ArrowRight size={15} /></button>
        <button className="btn btn-primary" onClick={() => navigate('/home')}>Back to Home</button>
      </div>
    </div>
  );
}
