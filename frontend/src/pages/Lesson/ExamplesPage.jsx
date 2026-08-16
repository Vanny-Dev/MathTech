import React, { useEffect, useState } from 'react';
import { SquareFunction, ArrowRight } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import { useNavigate } from 'react-router-dom';
import { getLessonApi } from '../../api/moduleApi.js';
import { useWorkbook } from '../../context/WorkbookContext.jsx';
import Loader from '../../components/shared/Loader.jsx';

export default function ExamplesPage() {
  const { moduleId } = useWorkbook();
  const navigate     = useNavigate();
  const [examples, setExamples] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!moduleId) { setLoading(false); return; }
    getLessonApi(moduleId)
      .then(({ data }) => setExamples(data.examples || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [moduleId]);

  if (loading) return <Loader text="Loading examples..." />;

  return (
    <div>
      <SectionTitle icon={SquareFunction} label="e.g.">Examples</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxWidth: '640px' }}>
        {examples.map((ex, i) => (
          <div key={i} className="comic-card">
            <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--teal)' }}>
              Example {i + 1}: {ex.title}
            </div>
            {ex.image && (
              <img src={ex.image} alt={ex.title}
                style={{ maxWidth: '100%', border: '2px solid var(--ink)', marginBottom: '0.5rem' }} />
            )}
            <p style={{ fontFamily: 'Nunito, sans-serif', lineHeight: 1.8 }}>{ex.content}</p>
          </div>
        ))}
      </div>
      <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/activities')}>
        Go to Activities <ArrowRight size={15} />
      </button>
    </div>
  );
}
