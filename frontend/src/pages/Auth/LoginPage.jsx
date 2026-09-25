import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Logo from '../../components/shared/Logo.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { loginApi } from '../../api/authApi.js';
import { useAuth } from '../../context/AuthContext.jsx';

// Students sign in with the short code their teacher gives them; teachers keep
// a normal password.
const CODE_LENGTH = 6;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [role, setRole]     = useState('student');
  const [form, setForm]     = useState({ username: '', code: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const isTeacher = role === 'teacher';

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Switching roles clears whatever was typed, so a code is never sent as a
  // password (or the reverse) just because the user changed their mind.
  const pickRole = (next) => {
    if (next === role) return;
    setRole(next);
    setError('');
    setForm({ username: '', code: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await loginApi(
        isTeacher
          ? { role, username: form.username, password: form.password }
          : { role, username: form.username, code: form.code.trim() }
      );
      login(data);
      navigate(data.role === 'teacher' ? '/teacher/dashboard' : '/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.panel}>
        {/* Header strip */}
        <div style={styles.header}>
          <Logo width={210} style={{ margin: "0 auto" }} />
          <p style={styles.subtitle}>Mathematics Edition</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.formTitle}>LOGIN</h2>

          {error && <div style={styles.error}>{error}</div>}

          {/* Who is signing in — decides whether the second field is a code
              or a password. */}
          <div style={styles.roleRow} role="group" aria-label="Sign in as">
            {[
              { value: 'student', label: 'STUDENT' },
              { value: 'teacher', label: 'TEACHER' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => pickRole(opt.value)}
                aria-pressed={role === opt.value}
                style={{
                  ...styles.roleBtn,
                  ...(role === opt.value ? styles.roleBtnOn : null),
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              className="comic-input"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          </div>

          {isTeacher ? (
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                className="comic-input"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>
          ) : (
            <div style={styles.field}>
              <label style={styles.label}>Access Code</label>
              <input
                className="comic-input"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder={`${CODE_LENGTH}-character code`}
                maxLength={CODE_LENGTH}
                required
              />
              <span style={styles.hint}>
                The {CODE_LENGTH}-character code your teacher gave you.
              </span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.8rem', fontSize: '1.1rem' }}
          >
            {loading ? 'Logging in...' : <>LET&apos;S GO <ArrowRight size={17} /></>}
          </button>

          {/* Only students sign themselves up — the teacher account is seeded. */}
          {!isTeacher && (
            <p style={styles.link}>
              No account?{' '}
              <Link to="/register" style={{ color: 'var(--teal)', fontWeight: 700 }}>
                Register here
              </Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'transparent',  /* let the body graph paper show through */
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  panel: {
    width: '100%',
    maxWidth: '420px',
    background: 'var(--white)',
    border: '3px solid var(--ink)',
    boxShadow: '6px 6px 0 var(--ink)',
  },
  header: {
    background: 'var(--teal)',
    borderBottom: '3px solid var(--ink)',
    padding: '1.2rem',
    textAlign: 'center',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontFamily: 'Fredoka One, cursive',
    fontSize: '1.6rem',
    letterSpacing: '1px',
    color: 'var(--ink)',
  },
  subtitle: {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.85rem',
    color: 'var(--ink)',
    marginTop: '0.2rem',
  },
  form: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formTitle: {
    fontFamily: 'Fredoka One, cursive',
    fontSize: '1.5rem',
    letterSpacing: '2px',
    borderBottom: '2px solid var(--ink)',
    paddingBottom: '0.4rem',
  },
  roleRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.5rem',
  },
  roleBtn: {
    padding: '0.55rem 0.4rem',
    background: 'var(--white)',
    border: '3px solid var(--ink)',
    cursor: 'pointer',
    fontFamily: 'Fredoka One, cursive',
    fontSize: '0.9rem',
    letterSpacing: '1px',
    color: 'var(--ink)',
  },
  roleBtnOn: {
    background: 'var(--teal)',
    boxShadow: 'inset 3px 3px 0 rgba(0,0,0,0.15)',
  },
  hint: {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.78rem',
    color: 'var(--muted-strong)',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
  },
  label: {
    fontFamily: 'Fredoka One, cursive',
    fontSize: '0.95rem',
    letterSpacing: '1px',
  },
  error: {
    background: 'var(--red)',
    color: 'var(--white)',
    padding: '0.5rem 0.8rem',
    border: '2px solid var(--ink)',
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.88rem',
    fontWeight: 700,
  },
  link: {
    textAlign: 'center',
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.9rem',
  },
};
