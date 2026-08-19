import React, { useEffect, useState } from 'react';
import { Library } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import { getModuleByIdApi } from '../../api/moduleApi.js';
import { useWorkbook } from '../../context/WorkbookContext.jsx';
import Loader from '../../components/shared/Loader.jsx';

export default function ReferencesPage() {
  const { moduleId } = useWorkbook();
  const [references, setReferences] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (!moduleId) { setLoading(false); return; }
    getModuleByIdApi(moduleId)
      .then(({ data }) => setReferences(data.references || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [moduleId]);

  if (loading) return <Loader text="Loading references..." />;

  return (
    <div>
      <SectionTitle icon={Library}>References</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxWidth: '640px' }}>
        {references.length === 0 ? (
          <div className="comic-card">No references listed for this module.</div>
        ) : (
          references.map((ref, i) => (
            <div key={i} className="comic-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1.1rem', color: 'var(--teal)', flexShrink: 0 }}>
                [{i + 1}]
              </span>
              <p style={{ fontFamily: 'Nunito, sans-serif', lineHeight: 1.7, fontSize: '0.95rem' }}>{ref}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
