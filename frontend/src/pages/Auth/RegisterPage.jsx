import React, { useState } from 'react';
import { ArrowRight, KeyRound } from 'lucide-react';
import Logo from '../../components/shared/Logo.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { registerApi } from '../../api/authApi.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]       = useState({ fullname: '', username: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  // The code the server issued, held until the student confirms they have
  // written it down. It is never shown again — only their teacher can read it
  // back — so the account is not opened until they acknowledge it.
  const [issued, setIssued]   = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await registerApi(form);
      setIssued(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const enter = () => {
    login(issued);
    navigate('/home');
  };

  if (issued) {
    return (
      <div style={styles.page}>
        <div style={styles.panel}>
          <div style={{ ...styles.header, background: 'var(--teal)' }}>
            <Logo width={210} style={{ margin: '0 auto' }} />
            <p style={styles.subtitle}>Account created</p>
          </div>

          <div style={styles.form}>
            <h2 style={styles.formTitle}>YOUR ACCESS CODE</h2>

            <p style={styles.codeIntro}>
              Write this down. You will type it with your username every time
              you log in.
            </p>

            <div style={styles.codeBox}>
              <KeyRound size={20} strokeWidth={2.5} />
              <span style={styles.codeText}>{issued.accessCode}</span>
            </div>

            <p style={styles.codeNote}>
              Forgot it? Ask your teacher — they can see your code and can give
              you a new one.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={enter}
              style={{ width: '100%', padding: '0.8rem', fontSize: '1.1rem' }}
            >
              I WROTE IT DOWN <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            { name: 'fullname', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
            { name: 'username', label: 'Username',  type: 'text', placeholder: 'Your username' },
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

          <p style={styles.hint}>
            No password needed — you will be given a 6-character access code to
            log in with.
          </p>

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
  hint: {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.82rem',
    color: 'var(--muted-strong)',
    margin: 0,
  },
  codeIntro: {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.9rem',
    margin: 0,
  },
  codeBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.6rem',
    background: 'var(--yellow)',
    border: '3px solid var(--ink)',
    boxShadow: '4px 4px 0 var(--ink)',
    padding: '1rem',
  },
  codeText: {
    fontFamily: 'Fredoka One, cursive',
    fontSize: '2.1rem',
    letterSpacing: '0.5rem',
    // The trailing letter-spacing would push the text off-centre
    marginLeft: '0.5rem',
  },
  codeNote: {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.82rem',
    color: 'var(--muted-strong)',
    margin: 0,
  },
  error: {
    background: 'var(--red)', color: 'var(--white)',
    padding: '0.5rem 0.8rem',
    border: '2px solid var(--ink)',
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.88rem', fontWeight: 700,
  },
  link: { textAlign: 'center', fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem' },
};
