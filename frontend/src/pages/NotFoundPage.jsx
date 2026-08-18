import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPinOff, Home, ArrowLeft } from 'lucide-react';
import Logo from '../components/shared/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Shown for any address the app does not recognise.
 *
 * This used to be a silent redirect to /login, which then bounced a signed-in
 * user to the home page — so a mistyped or outdated link (for example the
 * renamed /activities/interactive) left them somewhere else with no idea why.
 */
export default function NotFoundPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, isTeacher } = useAuth();

  const home = !user ? '/login' : isTeacher ? '/teacher/dashboard' : '/home';

  return (
    <div className="graph-paper" style={s.screen}>
      <div style={s.card}>
        <Logo width={200} style={{ margin: '0 auto' }} />

        <span style={s.badge}>
          <MapPinOff size={30} strokeWidth={2.5} />
        </span>

        <h1 style={s.code}>404</h1>
        <p style={s.title}>Page not found</p>

        <p style={s.body}>
          We could not find a page at this address. It may have been moved or
          renamed.
        </p>

        <code style={s.path}>{pathname}</code>

        <div style={s.actions}>
          <button className="btn btn-outline" style={s.btn} onClick={() => navigate(-1)}>
            <ArrowLeft size={15} /> Go back
          </button>
          <button className="btn btn-teal" style={s.btn} onClick={() => navigate(home, { replace: true })}>
            <Home size={15} /> {user ? 'Home' : 'Log in'}
          </button>
        </div>
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
    maxWidth: '420px',
    background: 'var(--white)',
    border: '3px solid var(--ink)',
    boxShadow: '6px 6px 0 var(--ink)',
    padding: '1.75rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.6rem',
    textAlign: 'center',
  },
  badge: {
    width: '58px',
    height: '58px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--yellow)',
    color: 'var(--ink)',
    border: '3px solid var(--ink)',
    boxShadow: '3px 3px 0 var(--ink)',
    marginTop: '0.4rem',
  },
  code: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '2.4rem',
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: '2px',
  },
  title: {
    fontFamily: 'Fredoka One, cursive',
    fontSize: '1.2rem',
  },
  body: {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.92rem',
    lineHeight: 1.7,
    color: 'var(--muted-strong)',
  },
  path: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.75rem',
    background: 'var(--paper-dark)',
    border: '2px dashed var(--muted)',
    padding: '0.35rem 0.6rem',
    maxWidth: '100%',
    overflowWrap: 'anywhere',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: '0.5rem',
  },
  btn: { fontSize: '0.88rem', padding: '0.5rem 0.9rem' },
};
