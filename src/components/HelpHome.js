import React, { useState } from 'react';
import MicTextarea from './MicTextarea';

const API_URL = process.env.REACT_APP_API_URL;

export const LANES = {
  home: { icon: '🏠', label: 'My Home', desc: 'Something is broken or needs fixing' },
  account: { icon: '💳', label: 'My Account', desc: 'Rent, payments, or your lease' },
  community: { icon: '👥', label: 'My Community', desc: 'Noise, parking, amenities, or neighbors' },
};

const ACCOUNT_CHIPS = ['Rent or balance', 'Payment problem', 'Lease question', 'Something else'];
const COMMUNITY_CHIPS = ['Noise', 'Parking', 'Amenities', 'A neighbor', 'Packages', 'Something else'];

const WORDS = {
  home: ['leak', 'broken', 'repair', 'fix', 'plumb', 'ac ', 'a/c', 'air condition', 'heat', 'hvac', 'water', 'toilet', 'sink', 'faucet', 'door', 'lock', 'light', 'power', 'outlet', 'oven', 'stove', 'fridge', 'refrigerator', 'dishwasher', 'pest', 'roach', 'mold', 'ceiling', 'window', 'drain', 'clog', 'smoke', 'gas'],
  account: ['rent', 'pay', 'payment', 'balance', 'charge', 'fee', 'lease', 'deposit', 'ledger', 'late', 'bill', 'renew', 'receipt', 'autopay'],
  community: ['noise', 'loud', 'neighbor', 'parking', 'tow', 'trash', 'dumpster', 'pool', 'gym', 'amenit', 'package', 'mail', 'pet', 'dog', 'barking', 'party', 'smoking'],
};

// Simple keyword guess; staff can move a request to another lane later.
export function suggestLane(text) {
  const t = ` ${String(text || '').toLowerCase()} `;
  let best = null, bestScore = 0;
  Object.keys(WORDS).forEach(lane => {
    const score = WORDS[lane].filter(w => t.includes(w)).length;
    if (score > bestScore) { best = lane; bestScore = score; }
  });
  return best;
}

const card = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px' };
const primaryBtn = { background: '#1B3A6B', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px 20px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' };
const ghostBtn = { background: '#fff', color: '#1B3A6B', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' };

function HelpHome({ token, onPickHome, onPickPtp, onSeeRequests, onCaseCreated }) {
  const [view, setView] = useState('tiles'); // tiles | account | community | suggest | sent
  const [text, setText] = useState('');
  const [chip, setChip] = useState('');
  const [suggested, setSuggested] = useState(null);
  const [choosing, setChoosing] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sentLs, setSentLs] = useState(false);

  const reset = () => { setView('tiles'); setText(''); setChip(''); setSuggested(null); setChoosing(false); setError(''); setSentLs(false); };

  const send = async (lane, description) => {
    setError('');
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/api/cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lane, description }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong. Please try again.'); setSending(false); return; }
      setSentLs(!!data.life_safety);
      setView('sent');
      if (onCaseCreated) onCaseCreated();
    } catch {
      setError('Could not connect. Please try again.');
    }
    setSending(false);
  };

  const pickLane = (lane, description) => {
    if (lane === 'home') { onPickHome(description || ''); return; }
    if (description) { send(lane, description); return; }
    setText(''); setChip(''); setError(''); setView(lane);
  };

  const continueFromBox = () => {
    const t = text.trim();
    if (t.length < 3) { setError('Tell us a little about what is going on.'); return; }
    setError('');
    const lane = suggestLane(t);
    setSuggested(lane);
    setChoosing(!lane);
    setView('suggest');
  };

  const Tile = ({ lane, onClick }) => (
    <button onClick={onClick}
      style={{ ...card, cursor: 'pointer', textAlign: 'center', padding: '26px 16px', border: '2px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '48px', lineHeight: 1 }}>{LANES[lane].icon}</span>
      <span style={{ fontSize: '18px', fontWeight: '800', color: '#111827' }}>{LANES[lane].label}</span>
      <span style={{ fontSize: '13px', color: '#6b7280' }}>{LANES[lane].desc}</span>
    </button>
  );

  const BackLink = () => (
    <button onClick={reset} style={{ background: 'none', border: 'none', color: '#1B3A6B', fontSize: '14px', fontWeight: '600', cursor: 'pointer', padding: 0, marginBottom: '14px' }}>← Back</button>
  );

  const Footer = () => (
    <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
      Fire, gas smell, or danger? <strong style={{ color: '#111827' }}>Call 911 first.</strong>
    </div>
  );

  if (view === 'sent') {
    return (
      <div style={{ maxWidth: '620px', margin: '0 auto' }}>
        <div style={{ ...card, textAlign: 'center', padding: '36px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>✅</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '6px' }}>Got it!</div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
            {sentLs ? 'We are alerting our on-call team now. If you smell gas, see fire or smoke, or anyone is in danger, call 911 right away.' : 'We will keep you updated in My Requests.'}
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onSeeRequests} style={primaryBtn}>See My Requests</button>
            <button onClick={reset} style={ghostBtn}>Back to start</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (view === 'account' || view === 'community') {
    const chips = view === 'account' ? ACCOUNT_CHIPS : COMMUNITY_CHIPS;
    const submit = () => {
      const t = text.trim();
      const description = chip && t ? `${chip}: ${t}` : (chip || t);
      if (!description || description.length < 3) { setError('Pick one above or tell us a little.'); return; }
      send(view, description);
    };
    return (
      <div style={{ maxWidth: '620px', margin: '0 auto' }}>
        <BackLink />
        <div style={card}>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '14px' }}>{LANES[view].icon} {LANES[view].label}</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>What is this about?</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {chips.map(c => (
              <button key={c} onClick={() => setChip(chip === c ? '' : c)}
                style={{ padding: '10px 16px', borderRadius: '20px', fontSize: '14px', cursor: 'pointer', fontWeight: chip === c ? '700' : '500',
                  border: chip === c ? '2px solid #1B3A6B' : '1px solid #cbd5e1', background: chip === c ? '#f0f4ff' : '#fff', color: chip === c ? '#1B3A6B' : '#374151' }}>
                {c}
              </button>
            ))}
          </div>
          <MicTextarea value={text} onChange={setText} placeholder="Tell us more (optional)" height={96} />
          {view === 'community' && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>🔒 Your name is never shared with a neighbor.</div>}
          {error && <div style={{ color: '#991b1b', fontSize: '13px', marginTop: '10px' }}>{error}</div>}
          <button onClick={submit} disabled={sending} style={{ ...primaryBtn, width: '100%', marginTop: '16px', opacity: sending ? 0.7 : 1 }}>{sending ? 'Sending...' : 'Send'}</button>
          {view === 'account' && (
            <button onClick={onPickPtp} style={{ ...ghostBtn, width: '100%', marginTop: '10px' }}>🤝 Need more time to pay?</button>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  if (view === 'suggest') {
    return (
      <div style={{ maxWidth: '620px', margin: '0 auto' }}>
        <BackLink />
        <div style={card}>
          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '14px', fontStyle: 'italic' }}>“{text.trim().slice(0, 140)}{text.trim().length > 140 ? '…' : ''}”</div>
          {suggested && !choosing ? (
            <>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '14px' }}>This sounds like {LANES[suggested].icon} {LANES[suggested].label}. Is that right?</div>
              <button onClick={() => pickLane(suggested, text.trim())} disabled={sending} style={{ ...primaryBtn, width: '100%', opacity: sending ? 0.7 : 1 }}>{sending ? 'Sending...' : 'Yes, that is right'}</button>
              <button onClick={() => setChoosing(true)} style={{ ...ghostBtn, width: '100%', marginTop: '10px' }}>No, let me choose</button>
            </>
          ) : (
            <>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '14px' }}>Which one fits best?</div>
              {Object.keys(LANES).map(l => (
                <button key={l} onClick={() => pickLane(l, text.trim())} disabled={sending}
                  style={{ ...ghostBtn, width: '100%', marginBottom: '10px', textAlign: 'left', fontSize: '16px' }}>
                  {LANES[l].icon} {LANES[l].label} <span style={{ color: '#6b7280', fontWeight: '400', fontSize: '13px' }}>— {LANES[l].desc}</span>
                </button>
              ))}
            </>
          )}
          {error && <div style={{ color: '#991b1b', fontSize: '13px', marginTop: '10px' }}>{error}</div>}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      <h2 style={{ margin: '0 0 16px', fontSize: '26px', fontWeight: '800', color: '#111827', textAlign: 'center' }}>How can we help?</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        {['home', 'account', 'community'].map(l => <Tile key={l} lane={l} onClick={() => pickLane(l)} />)}
      </div>
      <div style={{ ...card, marginTop: '20px' }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>Not sure? Tell us.</div>
        <MicTextarea value={text} onChange={setText} placeholder="Tell us what is going on" height={84} />
        {error && <div style={{ color: '#991b1b', fontSize: '13px', marginTop: '8px' }}>{error}</div>}
        <button onClick={continueFromBox} style={{ ...primaryBtn, width: '100%', marginTop: '12px' }}>Continue</button>
      </div>
      <Footer />
    </div>
  );
}

export default HelpHome;
