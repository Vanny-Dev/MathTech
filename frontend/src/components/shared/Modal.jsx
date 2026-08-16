import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ title, children, onClose }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.box} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>{title}</h3>
          <button style={styles.close} onClick={onClose} aria-label="Close"><X size={18} strokeWidth={3} /></button>
        </div>
        <div style={styles.body}>{children}</div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  box: {
    background: 'var(--white)',
    border: '3px solid var(--ink)',
    boxShadow: '6px 6px 0 var(--ink)',
    width: '90%', maxWidth: '480px',
    maxHeight: '80vh',
    display: 'flex', flexDirection: 'column',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.8rem 1rem',
    borderBottom: '3px solid var(--ink)',
    background: 'var(--teal)',
  },
  title: {
    fontFamily: 'Fredoka One, cursive',
    fontSize: '1.3rem',
    letterSpacing: '1px',
  },
  close: {
    background: 'none', border: 'none',
    fontSize: '1.1rem', cursor: 'pointer',
    fontFamily: 'Fredoka One, cursive',
  },
  body: {
    padding: '1.2rem',
    overflowY: 'auto',
  },
};
