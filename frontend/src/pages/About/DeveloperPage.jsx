import React, { useEffect, useState } from 'react';
import { Code2, Heart } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import { getModuleByIdApi } from '../../api/moduleApi.js';
import { useWorkbook } from '../../context/WorkbookContext.jsx';
import Loader from '../../components/shared/Loader.jsx';

export default function DeveloperPage() {
  const { moduleId } = useWorkbook();
  const [developer, setDeveloper] = useState('');
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!moduleId) { setLoading(false); return; }
    getModuleByIdApi(moduleId)
      .then(({ data }) => setDeveloper(data.developer || ''))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [moduleId]);

  if (loading) return <Loader text="Loading..." />;

  return (
    <div>
      <SectionTitle icon={Code2} label="dev">Developer</SectionTitle>
      <div className="comic-card" style={{ maxWidth: '500px', textAlign: 'center' }}>
        <div style={{
          width: '76px', height: '76px', margin: '0 auto 1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--board)', color: 'var(--teal)',
          border: '3px solid var(--ink)', boxShadow: '3px 3px 0 var(--ink)',
        }}>
          <Code2 size={38} strokeWidth={2.5} />
        </div>
        <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1.5rem', letterSpacing: '2px', marginBottom: '0.5rem' }}>
          {developer || 'Jovanny De Leon'}
        </div>
        <div style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--muted-strong)' }}>
          Creator of MathTech
        </div>
        <div style={{
          marginTop: '1.2rem',
          background: 'var(--yellow)',
          border: '2px solid var(--ink)',
          padding: '0.5rem 1rem',
          fontFamily: 'Nunito, sans-serif',
          fontSize: '0.9rem',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}>
            Built with <Heart size={15} strokeWidth={2.5} fill="currentColor" /> for Mathematics Education
          </span>
        </div>
      </div>
    </div>
  );
}
