import React, { useEffect, useState } from 'react';
import { Code2, Heart, BookOpen } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import { getModuleByIdApi } from '../../api/moduleApi.js';
import { useWorkbook } from '../../context/WorkbookContext.jsx';
import Loader from '../../components/shared/Loader.jsx';

const CONTENT_DEVELOPER = 'Dorie Jean Justiniana';

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

  const credits = [
    {
      icon: Code2,
      role: 'System Developer',
      math: 'dev',
      name: developer || 'Jovanny De Leon',
      note: 'Built and maintains the MathTech workbook',
    },
    {
      icon: BookOpen,
      role: 'Content Developer',
      math: 'content',
      name: CONTENT_DEVELOPER,
      note: 'Wrote the lessons, examples and activities',
    },
  ];

  return (
    <div>
      <SectionTitle icon={Code2} label="dev">About</SectionTitle>

      <div style={s.list}>
        {credits.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.role} className="comic-card" style={s.card}>
              <span style={s.badge}>
                <Icon size={28} strokeWidth={2.5} />
              </span>

              <div style={s.body}>
                <span className="formula-chip" style={s.chip}>{c.math}</span>
                <div style={s.role}>{c.role}</div>
                <div style={s.name}>{c.name}</div>
                <div style={s.note}>{c.note}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={s.banner}>
        <span style={s.bannerInner}>
          Built with <Heart size={15} strokeWidth={2.5} fill="currentColor" /> for Mathematics Education
        </span>
      </div>
    </div>
  );
}

const s = {
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    maxWidth: '520px',
  },
  card: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.9rem',
  },
  badge: {
    width: '58px',
    height: '58px',
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--board)',
    color: 'var(--teal)',
    border: '3px solid var(--ink)',
    boxShadow: '3px 3px 0 var(--ink)',
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  chip: {
    fontSize: '0.62rem',
    marginBottom: '0.35rem',
  },
  role: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    color: 'var(--muted-strong)',
  },
  name: {
    fontFamily: 'Fredoka One, cursive',
    fontSize: '1.25rem',
    letterSpacing: '0.5px',
    margin: '0.1rem 0 0.25rem',
    overflowWrap: 'anywhere',
  },
  note: {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.85rem',
    lineHeight: 1.6,
    color: 'var(--muted-strong)',
  },
  banner: {
    maxWidth: '520px',
    marginTop: '1.25rem',
    background: 'var(--yellow)',
    border: '2px solid var(--ink)',
    padding: '0.6rem 1rem',
    textAlign: 'center',
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.9rem',
    fontWeight: 700,
  },
  bannerInner: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    flexWrap: 'wrap',
  },
};
