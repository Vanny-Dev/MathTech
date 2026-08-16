import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, ClipboardList, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import useProgress from '../../hooks/useProgress.js';
import { useWorkbook } from '../../context/WorkbookContext.jsx';

export default function HomePage() {
  const { user } = useAuth();
  const { moduleId } = useWorkbook();
  const navigate = useNavigate();

  useProgress('home');

  const cards = [
    { icon: Play, label: 'Start', path: '/home/start', color: 'var(--teal)' },
    { icon: Info, label: 'About', path: '/home/about', color: 'var(--yellow)' },
    { icon: ClipboardList, label: 'Instructions', path: '/home/instructions', color: 'var(--white)' },
  ];

  return (
    <div>
      <h1 className="section-title">Home</h1>

      <div className="comic-card-blue" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1.5rem', letterSpacing: '2px' }}>
          Welcome back, {user?.fullname}.
        </h2>
        <p style={{ fontFamily: 'Nunito, sans-serif', marginTop: '0.4rem' }}>
          Ready to learn Mathematics through comic-style lessons? Let&apos;s go.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.path}
              onClick={() => navigate(c.path)}
              style={{
                background: c.color,
                border: '3px solid var(--ink)',
                boxShadow: '4px 4px 0 var(--ink)',
                padding: '1.2rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'transform 0.1s, box-shadow 0.1s',
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '4px 4px 0 var(--ink)'; }}
            >
              <div style={{ marginBottom: '0.4rem', display: 'flex', alignItems: 'center' }}>
                <Icon size={24} />
              </div>
              <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1.2rem', letterSpacing: '1px' }}>{c.label}</div>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button
          className="btn btn-primary"
          style={{ fontSize: '1rem', padding: '0.8rem 1.4rem' }}
          onClick={() => navigate(moduleId ? '/competencies' : '/topics')}
        >
          {moduleId ? 'Continue workbook' : 'Choose a topic'} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
