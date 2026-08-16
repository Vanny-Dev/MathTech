import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import { getAllStudentsApi } from '../../api/teacherApi.js';
import Loader from '../../components/shared/Loader.jsx';

export default function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getAllStudentsApi()
      .then(({ data }) => setStudents(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter((s) =>
    s.fullname.toLowerCase().includes(search.toLowerCase()) ||
    s.username.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader text="Loading students..." />;

  return (
    <div>
      <SectionTitle icon={Users} label="n =">All Students</SectionTitle>

      {/* Search */}
      <input
        className="comic-input"
        placeholder="Search by name or username..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ maxWidth: '360px', marginBottom: '1.2rem' }}
      />

      <div style={{ fontFamily: 'Nunito, sans-serif', marginBottom: '0.8rem', color: 'var(--muted)' }}>
        {filtered.length} student{filtered.length !== 1 ? 's' : ''} found
      </div>

      {/* Table */}
      <div className="comic-card" style={{ maxWidth: '720px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Nunito, sans-serif' }}>
          <thead>
            <tr style={{ background: 'var(--ink)', color: 'var(--white)' }}>
              {['#', 'Full Name', 'Username', 'Email', 'Joined'].map((h) => (
                <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', fontFamily: 'Fredoka One, cursive', fontSize: '0.9rem', letterSpacing: '1px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--muted)' }}>No students found</td></tr>
            ) : (
              filtered.map((s, i) => (
                <tr key={s._id} style={{ borderBottom: '1px solid var(--paper-dark)', background: i % 2 === 0 ? 'var(--white)' : 'var(--paper-dark)' }}>
                  <td style={{ padding: '0.6rem 1rem', color: 'var(--muted)', fontSize: '0.85rem' }}>{i + 1}</td>
                  <td style={{ padding: '0.6rem 1rem', fontWeight: 700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{
                        width: '30px', height: '30px',
                        background: 'var(--teal)',
                        border: '2px solid var(--ink)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Fredoka One, cursive', fontSize: '1rem', flexShrink: 0,
                      }}>
                        {s.fullname[0]?.toUpperCase()}
                      </div>
                      {s.fullname}
                    </div>
                  </td>
                  <td style={{ padding: '0.6rem 1rem', color: 'var(--muted-strong)' }}>@{s.username}</td>
                  <td style={{ padding: '0.6rem 1rem', color: 'var(--muted-strong)', fontSize: '0.88rem' }}>{s.email}</td>
                  <td style={{ padding: '0.6rem 1rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
