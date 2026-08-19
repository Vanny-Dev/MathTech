import React, { useEffect, useState } from 'react';
import { ListChecks, ArrowRight } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import { useNavigate } from 'react-router-dom';
import { getObjectivesApi } from '../../api/moduleApi.js';
import { useWorkbook } from '../../context/WorkbookContext.jsx';
import useProgress from '../../hooks/useProgress.js';
import Loader from '../../components/shared/Loader.jsx';

export default function ObjectivesPage() {
  const { moduleId } = useWorkbook();
  const navigate     = useNavigate();
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading]       = useState(true);

  useProgress('learningCompetencies');

  useEffect(() => {
    if (!moduleId) { setLoading(false); return; }
    getObjectivesApi(moduleId)
      .then(({ data }) => setObjectives(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [moduleId]);

  if (loading) return <Loader text="Loading objectives..." />;

  return (
    <div>
      <SectionTitle icon={ListChecks}>Learning Objectives</SectionTitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxWidth: '640px' }}>
        {objectives.length === 0 ? (
          <div className="comic-card">No objectives found for this module.</div>
        ) : (
          objectives.map((obj, i) => (
            <div key={i} className="comic-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1.5rem', color: 'var(--teal)' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <p style={{ fontFamily: 'Nunito, sans-serif', lineHeight: 1.7 }}>{obj}</p>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
        <button className="btn btn-outline" onClick={() => navigate('/competencies/competencies')}>
          View Competencies <ArrowRight size={15} />
        </button>
        <button className="btn btn-primary" onClick={() => navigate('/lesson')}>
          Go to Lesson <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
