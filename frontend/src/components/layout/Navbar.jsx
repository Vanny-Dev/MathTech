import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Menu } from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
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

      {/* Balances the two buttons on the left so the title sits truly centred */}
      <div style={styles.spacer} aria-hidden="true" />
    </header>
  );
}

const styles = {
  navbar: {
    position: 'sticky',
    top: 0,
    // Above page content, but below the mobile sidebar (1200) and its overlay (1100)
    zIndex: 900,
    minHeight: '56px',
    background: 'var(--white)',
    borderBottom: '3px solid var(--ink)',
    display: 'flex',
    alignItems: 'center',
    padding: '0.7rem 1rem',
    gap: '1rem',
  },
  leftGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    flexShrink: 0,
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
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
    // Long module titles must not push the bar wider than the screen
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  spacer: {
    width: '76px',   // 2 × 36px buttons + 0.4rem gap
    flexShrink: 0,
  },
};
