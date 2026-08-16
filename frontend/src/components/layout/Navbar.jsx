import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  Menu,
  Home,
  BookOpen,
  BookText,
  NotebookPen,
  MessageCircleMore,
  RotateCcw,
  BarChart3,
} from 'lucide-react';
import { useWorkbook } from '../../context/WorkbookContext.jsx';

const STEPS = [
  { key: 'home', icon: Home },
  { key: 'learningCompetencies', icon: BookOpen },
  { key: 'lesson', icon: BookText },
  { key: 'activities', icon: NotebookPen },
  { key: 'feedback', icon: MessageCircleMore },
  { key: 'review', icon: RotateCcw },
  { key: 'progress', icon: BarChart3 },
];

export default function Navbar({ onToggleSidebar }) {
  const { completedSections } = useWorkbook();
  const module = useSelector((s) => s.workbook.module);
  const navigate = useNavigate();

  return (
    <header style={styles.navbar}>
      <div style={styles.leftGroup}>
        <button type="button" onClick={onToggleSidebar} style={styles.iconButton} aria-label="Toggle navigation">
          <Menu size={18} />
        </button>
        <button type="button" onClick={() => navigate(-1)} style={styles.iconButton} aria-label="Go back">
          <ArrowLeft size={18} />
        </button>
      </div>

      <div style={styles.title}>{module?.title || 'MathTech'}</div>

      <div style={styles.steps}>
        <span className="formula-chip" style={{ marginRight: '0.5rem' }}>
          {STEPS.filter((s) => completedSections[s.key]).length}/{STEPS.length}
        </span>
        {STEPS.map((step, i) => {
          const done = completedSections[step.key];
          const Icon = step.icon;
          return (
            <React.Fragment key={step.key}>
              <div
                title={step.key}
                style={{
                  ...styles.dot,
                  background: done ? 'var(--yellow)' : 'var(--paper-dark)',
                  border: done ? '2px solid var(--ink)' : '2px solid var(--muted)',
                }}
              >
                <Icon size={14} />
              </div>
              {i < STEPS.length - 1 && <div style={{ ...styles.line, background: done ? 'var(--ink)' : 'var(--muted)' }} />}
            </React.Fragment>
          );
        })}
      </div>
    </header>
  );
}

const styles = {
  navbar: {
    minHeight: '56px',
    background: 'var(--white)',
    borderBottom: '3px solid var(--ink)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.7rem 1rem',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  leftGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  iconButton: {
    width: '36px',
    height: '36px',
    border: '2px solid var(--ink)',
    background: 'var(--white)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '2px 2px 0 var(--ink)',
  },
  title: {
    fontFamily: 'Fredoka One, cursive',
    fontSize: '1.1rem',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
    flex: 1,
    textAlign: 'center',
  },
  steps: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  dot: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
  },
  line: {
    width: '16px',
    height: '2px',
  },
};
