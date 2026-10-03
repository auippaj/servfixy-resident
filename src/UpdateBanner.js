import React, { useEffect, useState } from 'react';

const BUILD_ID = process.env.REACT_APP_BUILD_ID || 'dev';
const CHECK_MS = 60 * 1000;

// Shows "A new version is available" when a newer deploy is live, so nobody has to guess when to refresh.
export default function UpdateBanner() {
  const [stale, setStale] = useState(false);

  useEffect(() => {
    if (BUILD_ID === 'dev') return undefined;
    let stopped = false;
    const check = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!stopped && data && data.id && data.id !== 'dev' && data.id !== BUILD_ID) setStale(true);
      } catch (e) { /* offline or blocked: try again next time */ }
    };
    const iv = setInterval(check, CHECK_MS);
    const onVisible = () => { if (document.visibilityState === 'visible') check(); };
    document.addEventListener('visibilitychange', onVisible);
    check();
    return () => { stopped = true; clearInterval(iv); document.removeEventListener('visibilitychange', onVisible); };
  }, []);

  if (!stale) return null;
  return (
    <div style={{ position: 'fixed', left: '50%', bottom: '84px', transform: 'translateX(-50%)', zIndex: 10000, background: '#0C2A4A', color: '#fff',
      borderRadius: '28px', padding: '10px 14px 10px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 6px 24px rgba(0,0,0,0.3)', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
      <span>A new version is available</span>
      <button onClick={() => window.location.reload()}
        style={{ background: '#14B8A6', color: '#fff', border: 'none', borderRadius: '18px', padding: '8px 16px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>Refresh</button>
    </div>
  );
}
