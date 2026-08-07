import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  React.useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

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
      if (!res.ok) { setError(data.error || 'Login failed.'); setLoading(false); return; }
      onLogin(data.token, data.resident);
    } catch (err) {
      setError('Could not connect to server.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: isMobile ? 'column' : 'row', backgroundColor: '#F0F4F8', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Left navy panel */}
      <div style={{ width: isMobile ? '100%' : '420px', minWidth: isMobile ? 'unset' : '420px', backgroundColor: '#1B3A6B', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: isMobile ? 'flex-start' : 'center', padding: isMobile ? '40px 28px 32px' : '48px 40px', flexShrink: 0 }}>
        <img src="https://i.imgur.com/OKIqq0K.png" alt="Servfixy" style={{ width: '220px', marginBottom: '32px' }} />
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', textAlign: 'center', lineHeight: '1.6' }}>
          Your maintenance requests, status updates, and service history — all in one place.
        </div>
        <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {['Submit maintenance requests', 'Track technician arrival in real time', 'View your service history', 'Rate completed work'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#14B8A6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#fff', fontSize: '11px', fontWeight: '700' }}>✓</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right login panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>Resident Portal</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '32px' }}>Sign in to manage your home maintenance</p>

          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#991b1b', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', color: '#111827', backgroundColor: '#fff', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', color: '#111827', backgroundColor: '#fff', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', padding: '13px', backgroundColor: '#1B3A6B', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '24px' }}>
            Need help? Contact your property management office.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
