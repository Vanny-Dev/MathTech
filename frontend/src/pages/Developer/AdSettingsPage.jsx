import React, { useEffect, useState } from 'react';
import { Megaphone, AlertTriangle, History } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import Loader from '../../components/shared/Loader.jsx';
import {
  getDeveloperAdSettingsApi,
  updateDeveloperAdSettingsApi,
  getAdAuditLogApi,
} from '../../api/adsApi.js';

const FREQUENCY_OPTIONS = [
  {
    value: 'normal',
    label: 'Normal',
    description: 'Recommended for production. Ads appear in their configured placements at meaningful points.',
  },
  {
    value: 'frequent',
    label: 'Frequent',
    description: 'Shorter cooldowns and more ad opportunities, while still respecting a minimum cooldown between them.',
  },
  {
    value: 'every_action',
    label: 'Every Eligible Action',
    description: 'Developer/testing mode. Creates an ad opportunity after a meaningful action (finishing an activity, a quiz, a lesson) — never on incidental interactions like typing or scrolling.',
  },
];

export default function AdSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedAt, setSavedAt] = useState(null);

  const loadAll = () => {
    setLoading(true);
    setError('');
    Promise.all([getDeveloperAdSettingsApi(), getAdAuditLogApi(10)])
      .then(([settingsRes, logRes]) => {
        setSettings(settingsRes.data);
        setAuditLog(logRes.data || []);
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load advertisement settings'))
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, []);

  const handleSave = () => {
    if (!settings) return;
    setSaving(true);
    setError('');
    setSavedAt(null);
    updateDeveloperAdSettingsApi({
      adsEnabled: settings.adsEnabled,
      adFrequency: settings.adFrequency,
      cooldownSeconds: Number(settings.cooldownSeconds),
    })
      .then(({ data }) => {
        setSettings(data);
        setSavedAt(new Date());
        return getAdAuditLogApi(10).then(({ data: log }) => setAuditLog(log || []));
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not save advertisement settings'))
      .finally(() => setSaving(false));
  };

  if (loading) return <Loader text="Loading advertisement settings..." />;

  if (!settings) {
    return (
      <div>
        <SectionTitle icon={Megaphone}>Advertisement Settings</SectionTitle>
        <div className="comic-card">{error || 'Unable to load settings.'}</div>
      </div>
    );
  }

  return (
    <div>
      <SectionTitle icon={Megaphone}>Advertisement Settings</SectionTitle>

      {error && (
        <div className="comic-card" style={{ background: 'var(--red-soft)', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div className="comic-card" style={{ marginBottom: '1rem' }}>
        <h3 style={styles.groupTitle}>Ads</h3>
        <p style={styles.groupHint}>
          Global switch. When OFF, no advertisement is requested or rendered anywhere in the app.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className={`btn ${settings.adsEnabled ? 'btn-green' : 'btn-outline'}`}
            onClick={() => setSettings((s) => ({ ...s, adsEnabled: true }))}
          >
            ON
          </button>
          <button
            type="button"
            className={`btn ${!settings.adsEnabled ? 'btn-red' : 'btn-outline'}`}
            onClick={() => setSettings((s) => ({ ...s, adsEnabled: false }))}
          >
            OFF
          </button>
        </div>
      </div>

      <div className="comic-card" style={{ marginBottom: '1rem' }}>
        <h3 style={styles.groupTitle}>Frequency</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {FREQUENCY_OPTIONS.map((opt) => (
            <label key={opt.value} style={styles.radioRow}>
              <input
                type="radio"
                name="adFrequency"
                value={opt.value}
                checked={settings.adFrequency === opt.value}
                onChange={() => setSettings((s) => ({ ...s, adFrequency: opt.value }))}
              />
              <div>
                <div style={styles.radioLabel}>{opt.label}</div>
                <div style={styles.groupHint}>{opt.description}</div>
              </div>
            </label>
          ))}
        </div>

        {settings.adFrequency === 'every_action' && (
          <div style={styles.warning}>
            <AlertTriangle size={18} strokeWidth={2.5} />
            <div>
              <strong>High-Frequency / Testing Mode.</strong> This mode can create a more
              aggressive advertisement experience. Verify that the resulting behavior complies
              with the current Google AdSense policies before using it in production. Never
              encourage or generate advertisement clicks.
            </div>
          </div>
        )}
      </div>

      <div className="comic-card" style={{ marginBottom: '1rem' }}>
        <h3 style={styles.groupTitle}>Cooldown</h3>
        <p style={styles.groupHint}>
          Minimum time between ad opportunities for the same placement. Higher frequency modes
          shorten this automatically but never remove it entirely.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <input
            type="number"
            className="comic-input"
            min={0}
            max={3600}
            style={{ maxWidth: '120px' }}
            value={settings.cooldownSeconds}
            onChange={(e) => setSettings((s) => ({ ...s, cooldownSeconds: e.target.value }))}
          />
          <span style={styles.groupHint}>seconds</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {savedAt && <span style={styles.groupHint}>Saved at {savedAt.toLocaleTimeString()}</span>}
      </div>

      <div className="comic-card">
        <h3 style={{ ...styles.groupTitle, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <History size={16} /> Recent Changes
        </h3>
        {auditLog.length === 0 ? (
          <p style={styles.groupHint}>No changes recorded yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {auditLog.map((entry) => (
              <div key={entry._id} style={styles.logRow}>
                <div style={styles.groupHint}>
                  {new Date(entry.createdAt).toLocaleString()} — {entry.developerName} ({entry.developerUsername})
                </div>
                <div style={styles.logDiff}>
                  Ads: {String(entry.previous.adsEnabled)} → {String(entry.next.adsEnabled)} · Frequency:{' '}
                  {entry.previous.adFrequency} → {entry.next.adFrequency} · Cooldown:{' '}
                  {entry.previous.cooldownSeconds}s → {entry.next.cooldownSeconds}s
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  groupTitle: {
    fontFamily: 'Fredoka One, cursive',
    fontSize: '1rem',
    letterSpacing: '0.5px',
    marginTop: 0,
    marginBottom: '0.4rem',
  },
  groupHint: {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.82rem',
    color: 'var(--muted-strong)',
    margin: '0 0 0.6rem 0',
  },
  radioRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.6rem',
    cursor: 'pointer',
  },
  radioLabel: {
    fontFamily: 'Nunito, sans-serif',
    fontWeight: 700,
    fontSize: '0.92rem',
  },
  warning: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.6rem',
    marginTop: '1rem',
    padding: '0.75rem',
    background: 'var(--yellow-soft)',
    border: '2px solid var(--ink)',
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.85rem',
  },
  logRow: {
    borderBottom: '1px solid var(--grid-line)',
    paddingBottom: '0.5rem',
  },
  logDiff: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.78rem',
  },
};
