import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Logo from '../../components/shared/Logo.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { registerApi } from '../../api/authApi.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm] = useState({ fullname: '', username: '', email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await registerApi(form);
      login(data);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <Logo width={210} style={{ margin: "0 auto" }} />
          <p style={styles.subtitle}>Create your student account</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.formTitle}>REGISTER</h2>

          {error && <div style={styles.error}>{error}</div>}

          {[
            { name: 'fullname', label: 'Full Name',   type: 'text',     placeholder: 'Your full name' },
            { name: 'username', label: 'Username',    type: 'text',     placeholder: 'Your username' },
            { name: 'email',    label: 'Email',       type: 'email',    placeholder: 'Your email address' },
            { name: 'password', label: 'Password',    type: 'password', placeholder: 'Your password' },
          ].map((field) => (
            <div key={field.name} style={styles.field}>
              <label style={styles.label}>{field.label}</label>
              <input
                className="comic-input"
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required
              />
            </div>
          ))}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.8rem', fontSize: '1.1rem' }}
          >
            {loading ? 'Creating account...' : <>CREATE ACCOUNT <ArrowRight size={16} /></>}
          </button>

          <p style={styles.link}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--teal)', fontWeight: 700 }}>
              Login here
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
    background: 'var(--yellow)',
    borderBottom: '3px solid var(--ink)',
    padding: '1.2rem',
    textAlign: 'center',
  },
  title: {
    fontFamily: 'Fredoka One, cursive',
    fontSize: '1.8rem',
    letterSpacing: '3px',
  },
  subtitle: {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.85rem',
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
  field: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  label: { fontFamily: 'Fredoka One, cursive', fontSize: '0.95rem', letterSpacing: '1px' },
  error: {
    background: 'var(--red)', color: 'var(--white)',
    padding: '0.5rem 0.8rem',
    border: '2px solid var(--ink)',
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.88rem', fontWeight: 700,
  },
  link: { textAlign: 'center', fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem' },
};
