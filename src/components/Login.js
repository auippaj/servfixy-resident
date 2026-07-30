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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1B3A6B', padding: '24px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '40px 36px', width: '100%', maxWidth: '480px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img
            src="https://i.imgur.com/An6s6sp.png"
            alt="Servfixy"
            style={{ width: '320px', marginBottom: '12px' }}
          />
          <p style={{ color: '#6b7280', margin: '0', fontSize: '14px' }}>
            Resident Portal
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#991b1b', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', backgroundColor: '#f0f4ff', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', backgroundColor: '#f0f4ff', boxSizing: 'border-box' }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: '100%', padding: '13px', backgroundColor: '#1B3A6B', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

      </div>
    </div>
  );
}

export default Login;
