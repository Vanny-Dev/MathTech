import React, { useEffect, useState } from 'react';
import { Target, ArrowRight } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import { useNavigate } from 'react-router-dom';
import { getCompetenciesApi } from '../../api/moduleApi.js';
import { useWorkbook } from '../../context/WorkbookContext.jsx';
import Loader from '../../components/shared/Loader.jsx';

export default function CompetenciesPage() {
  const { moduleId } = useWorkbook();
  const navigate     = useNavigate();
  const [competencies, setCompetencies] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    if (!moduleId) { setLoading(false); return; }
    getCompetenciesApi(moduleId)
      .then(({ data }) => setCompetencies(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [moduleId]);

  if (loading) return <Loader text="Loading competencies..." />;

  return (
    <div>
      <SectionTitle icon={Target}>Learning Competencies</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxWidth: '640px' }}>
        {competencies.map((c, i) => (
          <div key={i} className="comic-card-blue" style={{ display: 'flex', gap: '1rem' }}>
            <p style={{ fontFamily: 'Nunito, sans-serif', lineHeight: 1.7 }}>{c}</p>
          </div>
        ))}
      </div>
      <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/lesson')}>
        Proceed to Lesson <ArrowRight size={15} />
      </button>
    </div>
  );
}
