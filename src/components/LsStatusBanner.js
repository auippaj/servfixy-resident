import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

// Life Safety status banner. Shown only for requests the system flagged as Life Safety.
// Live technician position appears only while en route and within 10 miles (the server enforces this).
function LsStatusBanner({ request, token }) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/api/residents/requests/${request.id}/ls-status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (alive) setStatus(data);
      } catch (e) { /* keep the last known status */ }
    };
    load();
    const iv = setInterval(load, 15000);
    return () => { alive = false; clearInterval(iv); };
  }, [request.id, token]);

  if (!status || !status.is_ls) return null;

  const box = (bg, children) => (
    <div onClick={e => e.stopPropagation()} style={{ background: bg, borderRadius: '10px', padding: '12px', marginBottom: '10px', color: '#fff' }}>
      {children}
    </div>
  );
  const title = (t) => <div style={{ fontSize: '13px', fontWeight: '800', marginBottom: '4px' }}>{t}</div>;
  const body = (t) => <div style={{ fontSize: '12px', lineHeight: '1.5', opacity: 0.95 }}>{t}</div>;

  if (status.state === 'pending') {
    return box('#B91C1C', <>
      {title('🚨 Emergency request received')}
      {body('We are alerting our on-call team now. If anyone is in danger, call 911 right away.')}
    </>);
  }
  if (status.state === 'responding') {
    return box('#B45309', <>
      {title('Our team is responding')}
      {body('Someone from our team will be reaching out to you immediately. If anyone is in danger, call 911.')}
    </>);
  }
  if (status.state === 'arrived') {
    return box('#0F6E56', <>
      {title('✅ Your technician has arrived')}
      {body('Show your verification code to confirm.')}
    </>);
  }

  // en_route
  const loc = status.tech_location;
  let mapSrc = null, mapLink = null, ageSec = null;
  if (loc) {
    const pts = [[loc.lat, loc.lng]];
    if (status.destination) pts.push([status.destination.lat, status.destination.lng]);
    const lats = pts.map(p => p[0]), lngs = pts.map(p => p[1]);
    const padLat = Math.max(0.01, (Math.max(...lats) - Math.min(...lats)) * 0.3);
    const padLng = Math.max(0.01, (Math.max(...lngs) - Math.min(...lngs)) * 0.3);
    const bbox = [Math.min(...lngs) - padLng, Math.min(...lats) - padLat, Math.max(...lngs) + padLng, Math.max(...lats) + padLat].join(',');
    mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${loc.lat},${loc.lng}`;
    mapLink = `https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lng}#map=14/${loc.lat}/${loc.lng}`;
    ageSec = loc.updated_at ? Math.max(0, Math.round((Date.now() - new Date(loc.updated_at).getTime()) / 1000)) : null;
  }

  return box('#0F766E', <>
    {title('🚗 Your technician is on the way')}
    {loc ? (
      <>
        {body(`About ${loc.distance_miles} miles away${ageSec !== null ? ` · updated ${ageSec}s ago` : ''}.`)}
        <iframe title="Technician location" src={mapSrc} style={{ width: '100%', height: '180px', border: 0, borderRadius: '8px', marginTop: '8px', background: '#fff' }} loading="lazy" />
        <div style={{ fontSize: '11px', marginTop: '6px', opacity: 0.9 }}>
          Coordinates: {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)} ·{' '}
          <a href={mapLink} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'underline' }}>Open map</a>
        </div>
      </>
    ) : body('Live location appears here once your technician is within 10 miles.')}
  </>);
}

export default LsStatusBanner;
