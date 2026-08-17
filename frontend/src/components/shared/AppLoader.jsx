import React, { useEffect, useRef, useState } from 'react';
import Logo from './Logo.jsx';

/**
 * Startup splash that gates the app until the things it actually needs are
 * ready. Progress is driven by real work finishing — web fonts, the character
 * artwork, and the API answering — so a fast connection clears it almost
 * instantly while a slow one shows genuine progress instead of a fake timer.
 *
 * Every step resolves rather than rejects, and a hard ceiling guarantees the
 * app always opens even if something is unreachable. A loading screen must
 * never be able to trap the user.
 */

const CHARACTER_ART = [
  'teacher',
  'dark_idle',
  'dark_happy',
  'dark_serious',
  'light_thinking',
  'light_happy',
  'light_sad',
];

// Never hold the user longer than this, whatever is still pending.
const MAX_WAIT_MS = 25000;
// After this long the backend is probably a sleeping free-tier instance.
const COLD_START_HINT_MS = 4000;

const healthUrl = () => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return base.replace(/\/api\/?$/, '') + '/health';
};

// Resolves (never rejects) once the image is in the browser cache.
const preloadImage = (name) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve;   // a missing file must not block startup
    img.src = `/assets/characters/${name}.png`;
  });

const waitForFonts = () =>
  document.fonts?.ready ? document.fonts.ready.catch(() => {}) : Promise.resolve();

const pingApi = () =>
  fetch(healthUrl(), { cache: 'no-store' }).then(
    () => {},
    () => {},                 // offline or backend down — open the app anyway
  );

export default function AppLoader({ children }) {
  const [ready, setReady]   = useState(false);
  const [done, setDone]     = useState(0);
  const [status, setStatus] = useState('Loading fonts...');
  const [slowApi, setSlowApi] = useState(false);
  const total = useRef(CHARACTER_ART.length + 2).current;   // art + fonts + api

  useEffect(() => {
    let cancelled = false;
    const bump = () => !cancelled && setDone((n) => n + 1);

    const ceiling = setTimeout(() => !cancelled && setReady(true), MAX_WAIT_MS);
    const coldHint = setTimeout(() => !cancelled && setSlowApi(true), COLD_START_HINT_MS);

    const run = async () => {
      await waitForFonts();
      bump();
      if (cancelled) return;

      setStatus('Loading characters...');
      await Promise.all(CHARACTER_ART.map((n) => preloadImage(n).then(bump)));
      if (cancelled) return;

      setStatus('Connecting to server...');
      await pingApi();
      bump();
      clearTimeout(coldHint);
      if (cancelled) return;

      setStatus('Ready');
      setReady(true);
    };

    run();
    return () => {
      cancelled = true;
      clearTimeout(ceiling);
      clearTimeout(coldHint);
    };
  }, []);

  if (ready) return children;

  const pct = Math.min(100, Math.round((done / total) * 100));
  const showColdStart = slowApi && status === 'Connecting to server...';

  return (
    <div className="graph-paper" style={s.screen}>
      <div style={s.card}>
        <Logo width={240} style={{ margin: "0 auto" }} />

        <div style={s.barOuter}>
          <div style={{ ...s.barInner, width: `${pct}%` }} />
        </div>

        <div style={s.meta}>
          <span style={s.status}>
            {showColdStart ? 'Waking up the server...' : status}
          </span>
          <span style={s.pct}>{pct}%</span>
        </div>

        {showColdStart && (
          <p style={s.hint}>
            The server sleeps when idle. The first load can take up to a minute.
          </p>
        )}
      </div>
    </div>
  );
}

const s = {
  screen: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  card: {
    width: '100%',
    maxWidth: '340px',
    background: 'var(--white)',
    border: '3px solid var(--ink)',
    boxShadow: '6px 6px 0 var(--ink)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.9rem',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  mark: {
    width: '34px',
    height: '34px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--teal)',
    color: 'var(--ink)',
    border: '2px solid var(--ink)',
    fontFamily: 'JetBrains Mono, monospace',
    fontWeight: 700,
    fontSize: '1.1rem',
  },
  name: {
    fontFamily: 'Fredoka One, cursive',
    fontSize: '1.5rem',
    letterSpacing: '0.5px',
  },
  barOuter: {
    height: '18px',
    background: 'var(--paper-dark)',
    border: '2px solid var(--ink)',
    overflow: 'hidden',
  },
  barInner: {
    height: '100%',
    background: 'var(--teal)',
    borderRight: '2px solid var(--ink)',
    transition: 'width 0.35s ease',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
  },
  status: {
    fontFamily: 'Nunito, sans-serif',
    fontWeight: 700,
    fontSize: '0.82rem',
    color: 'var(--muted-strong)',
    minWidth: 0,
  },
  pct: {
    fontFamily: 'JetBrains Mono, monospace',
    fontWeight: 700,
    fontSize: '0.82rem',
    flexShrink: 0,
  },
  hint: {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.75rem',
    lineHeight: 1.5,
    color: 'var(--muted-strong)',
    background: 'var(--yellow-soft)',
    border: '2px dashed var(--muted)',
    padding: '0.45rem 0.6rem',
    margin: 0,
  },
};
