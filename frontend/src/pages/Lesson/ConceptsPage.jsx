import React, { useEffect, useState } from 'react';
import { Sigma, ArrowRight } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import { useNavigate } from 'react-router-dom';
import { getLessonApi } from '../../api/moduleApi.js';
import { useWorkbook } from '../../context/WorkbookContext.jsx';
import Loader from '../../components/shared/Loader.jsx';

export default function ConceptsPage() {
  const { moduleId } = useWorkbook();
  const navigate     = useNavigate();
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!moduleId) { setLoading(false); return; }
    getLessonApi(moduleId)
      .then(({ data }) => setConcepts(data.concepts || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [moduleId]);

  if (loading) return <Loader text="Loading concepts..." />;

  return (
    <div>
      <SectionTitle icon={Sigma} label="∴">Concepts</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxWidth: '640px' }}>
        {concepts.map((c, i) => (
          <div key={i} className="comic-card" style={{ borderLeft: '6px solid var(--teal)' }}>
            <p style={{ fontFamily: 'Nunito, sans-serif', lineHeight: 1.8 }}>{c}</p>
          </div>
        ))}
      </div>
      <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/lesson/examples')}>
        See Examples <ArrowRight size={15} />
      </button>
    </div>
  );
}
