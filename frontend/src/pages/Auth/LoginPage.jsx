import React, { useState } from 'react';
import { Sigma, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { loginApi } from '../../api/authApi.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]     = useState({ username: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await loginApi(form);
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
          <h1 style={styles.title}>
            <Sigma size={26} strokeWidth={2.5} /> MATHTECH
          </h1>
          <p style={styles.subtitle}>Mathematics Edition</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.formTitle}>LOGIN</h2>

          {error && <div style={styles.error}>{error}</div>}

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

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.8rem', fontSize: '1.1rem' }}
          >
            {loading ? 'Logging in...' : <>LET&apos;S GO <ArrowRight size={17} /></>}
          </button>

          <p style={styles.link}>
            No account?{' '}
            <Link to="/register" style={{ color: 'var(--teal)', fontWeight: 700 }}>
              Register here
            </Link>
          </p>
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
