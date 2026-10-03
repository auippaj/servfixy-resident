import React, { useState } from 'react';
import RequestCard from './RequestCard';
import { LANES } from './HelpHome';

const STATUS = {
  received: { label: 'Received', bg: '#e6f1fb', text: '#185FA5' },
  working: { label: 'Working on it', bg: '#faeeda', text: '#633806' },
  needs_resident: { label: 'Needs you', bg: '#fee2e2', text: '#991b1b' },
  done: { label: 'Done', bg: '#e1f5ee', text: '#0F6E56' },
};

function CaseCard({ item }) {
  const lane = LANES[item.lane] || LANES.home;
  const st = STATUS[item.status] || STATUS.received;
  const when = item.updated ? new Date(item.updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '14px' }}>
      <span style={{ fontSize: '32px' }}>{lane.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title || lane.label}</div>
        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{lane.label}{when ? ` · ${when}` : ''}</div>
      </div>
      <span style={{ background: st.bg, color: st.text, borderRadius: '14px', padding: '5px 12px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap' }}>{st.label}</span>
    </div>
  );
}

// One list for every lane. Maintenance items keep the rich request card (tracker, Life Safety banner).
function CaseList({ cases, requests, doneStatuses, activeRequest, setActiveRequest, token, loading, onStart }) {
  const [showDone, setShowDone] = useState(false);
  if (loading) {
    return <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#9ca3af', border: '1px solid #e5e7eb' }}>Loading...</div>;
  }

  const reqById = {};
  requests.forEach(r => { reqById[r.id] = r; });
  const linked = new Set();
  const items = [];

  cases.forEach(c => {
    if (c.service_request_id && reqById[c.service_request_id]) {
      const r = reqById[c.service_request_id];
      linked.add(r.id);
      items.push({ key: c.id, lane: 'home', request: r, done: doneStatuses.includes(r.status), updated: c.updated_at || r.created_at });
    } else {
      items.push({ key: c.id, lane: c.lane, title: c.title, status: c.status, done: c.status === 'done', updated: c.updated_at });
    }
  });
  // Safety net: any maintenance request without a case still shows up.
  requests.forEach(r => {
    if (!linked.has(r.id) && !cases.some(c => c.service_request_id === r.id)) {
      items.push({ key: 'sr-' + r.id, lane: 'home', request: r, done: doneStatuses.includes(r.status), updated: r.created_at });
    }
  });
  items.sort((a, b) => new Date(b.updated) - new Date(a.updated));

  const open = items.filter(i => !i.done);
  const done = items.filter(i => i.done);
  const render = (i, past) => i.request
    ? <RequestCard key={i.key} request={i.request} active={activeRequest && activeRequest.id === i.request.id} onClick={() => setActiveRequest(i.request)} past={past} token={token} />
    : <CaseCard key={i.key} item={i} />;

  return (
    <div style={{ maxWidth: '760px' }}>
      {open.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '48px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>✅</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>Nothing open right now</div>
          <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>If you need anything, we are here.</div>
          <button onClick={onStart} style={{ marginTop: '16px', background: '#1B3A6B', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 22px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>How can we help?</button>
        </div>
      ) : open.map(i => render(i, false))}

      {done.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <button onClick={() => setShowDone(!showDone)} style={{ background: 'none', border: 'none', color: '#1B3A6B', fontSize: '14px', fontWeight: '700', cursor: 'pointer', padding: 0, marginBottom: '10px' }}>
            {showDone ? '▾' : '▸'} Done ({done.length})
          </button>
          {showDone && done.map(i => render(i, true))}
        </div>
      )}
    </div>
  );
}

export default CaseList;
