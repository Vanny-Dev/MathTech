import React from 'react';

export default function Loader({ text = 'Loading...' }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.box}>
        <div style={styles.spinner} />
        <p style={styles.text}>{text}</p>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
  },
  box: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    background: 'var(--white)',
    border: '3px solid var(--ink)',
    boxShadow: '4px 4px 0 var(--ink)',
    padding: '2rem',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '4px solid var(--paper-dark)',
    borderTop: '4px solid var(--ink)',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  text: {
    fontFamily: 'Fredoka One, cursive',
    fontSize: '1.1rem',
    letterSpacing: '1px',
  },
};
