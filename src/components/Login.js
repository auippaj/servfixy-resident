import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [smsConsent, setSmsConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/residents/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, smsConsent })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed.'); setLoading(false); return; }
      onLogin(data.token, data.resident);
    } catch (err) {
      setError('Could not connect to server.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', fontFamily: "'Inter', system-ui, sans-serif", padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Logo */}
        <img src="https://i.imgur.com/nvDoU8X.png" alt="Servfixy" style={{ width: '280px', marginBottom: '36px' }} />

        {/* Heading */}
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', marginBottom: '28px', alignSelf: 'flex-start' }}>Sign in to Resident Portal</h1>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#991b1b', marginBottom: '16px', width: '100%', boxSizing: 'border-box' }}>
            {error}
          </div>
        )}

        {/* Email */}
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{ width: '100%', padding: '14px 18px', border: 'none', borderRadius: '12px', fontSize: '14px', color: '#111827', backgroundColor: '#EEF2F7', boxSizing: 'border-box', marginBottom: '14px', outline: 'none' }}
        />

        {/* Password */}
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{ width: '100%', padding: '14px 18px', border: 'none', borderRadius: '12px', fontSize: '14px', color: '#111827', backgroundColor: '#EEF2F7', boxSizing: 'border-box', marginBottom: '20px', outline: 'none' }}
        />

        {/* SMS Consent — required for Twilio A2P 10DLC compliance. Must be unchecked by default. */}
        <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #14B8A6', borderRadius: '10px', padding: '14px 16px', marginBottom: '24px', width: '100%', boxSizing: 'border-box' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={smsConsent}
              onChange={e => setSmsConsent(e.target.checked)}
              style={{ marginTop: '2px', width: '16px', height: '16px', flexShrink: 0, accentColor: '#14B8A6', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '12px', color: '#134e4a', lineHeight: '1.6' }}>
              <strong>Optional:</strong> I agree to receive SMS text notifications from Servfixy regarding my maintenance requests, appointment confirmations, and property updates. Message frequency varies (typically 1-5 messages per work order). Message and data rates may apply. Reply <strong>STOP</strong> to opt out at any time, <strong>HELP</strong> for assistance. Mobile information will not be shared with third parties for marketing. See our{' '}
              <a href="https://servfixy.com/privacy" target="_blank" rel="noreferrer" style={{ color: '#0f766e', textDecoration: 'underline' }}>Privacy Policy</a>{' '}and{' '}
              <a href="https://servfixy.com/terms" target="_blank" rel="noreferrer" style={{ color: '#0f766e', textDecoration: 'underline' }}>Terms of Use</a>.
            </span>
          </label>
        </div>

        {/* Sign In button */}
        <div style={{ alignSelf: 'flex-start' }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ padding: '13px 28px', backgroundColor: '#14B8A6', color: 'white', border: 'none', borderRadius: '50px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default Login;
