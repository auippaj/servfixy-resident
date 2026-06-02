import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/residents/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed.');
        setLoading(false);
        return;
      }
      onLogin(data.token, data.resident);
    } catch (err) {
      setError('Could not connect to server.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1f3d', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '560px' }}>

        <div style={{ background: '#fff', borderRadius: '20px', padding: '1.75rem 2.5rem', border: '1px solid #e5e7eb' }}>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img
              src="https://i.imgur.com/eX28z4J.png"
              alt="Servfixy"
              style={{ width: '420px', marginBottom: '4px' }}
            />
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Apartment Service Provider for Brant Rock
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#991b1b', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '10px', padding: '12px 14px', fontSize: '14px' }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '10px', padding: '12px 14px', fontSize: '14px' }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', background: '#1B3A6B', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '15px', fontWeight: '500', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          

        </div>
      </div>
    </div>
  );
}

export default Login;