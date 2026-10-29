import React, { useState, useEffect, useCallback } from 'react';
import MicTextarea from './MicTextarea';

const API_URL = process.env.REACT_APP_API_URL;

const card = { backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '16px' };
const label = { fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' };
const money = (n) => `$${(Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// Dates from the server may arrive as 2026-10-14 or 2026-10-14T00:00:00.000Z. Only the first 10 characters matter.
const ymd = (v) => String(v || '').slice(0, 10);
const day = (v, opts) => new Date(`${ymd(v)}T00:00:00`).toLocaleDateString('en-US', opts || { weekday: 'short', month: 'short', day: 'numeric' });
const cents = (v) => Math.round((parseFloat(v) || 0) * 100);

// The server decides what a resident may do. This screen only shows it. The balance, dates and methods all come from the server.
function PTPPortal({ token }) {
  const [info, setInfo] = useState(null);       // { state, message, balance, dates, methods, max_installments, window }
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [view, setView] = useState('new'); // 'new' | 'history'
  const [requestType, setRequestType] = useState('ptp');
  const [selectedDate, setSelectedDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [installments, setInstallments] = useState([{ date: '', amount: '' }, { date: '', amount: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null); // 'submitted' | 'routed'
  const [error, setError] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  const loadInfo = useCallback(() => {
    setLoadFailed(false);
    return fetch(`${API_URL}/api/ptp-requests/available-dates`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error('bad'); return r.json(); })
      .then(data => { setInfo(data); setLoadingInfo(false); })
      .catch(() => { setLoadFailed(true); setLoadingInfo(false); });
  }, [token]);

  const loadRequests = useCallback(() => {
    return fetch(`${API_URL}/api/ptp-requests/my-requests`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setMyRequests(data.requests || []); setLoadingRequests(false); })
      .catch(() => setLoadingRequests(false));
  }, [token]);

  useEffect(() => { loadInfo(); loadRequests(); }, [loadInfo, loadRequests]);

  const updateInstallment = (i, field, val) => setInstallments(prev => prev.map((inst, idx) => idx === i ? { ...inst, [field]: val } : inst));
  const maxInst = info?.max_installments || 3;
  const addInstallment = () => setInstallments(prev => (prev.length < maxInst ? [...prev, { date: '', amount: '' }] : prev));
  const removeInstallment = (i) => setInstallments(prev => (prev.length > 2 ? prev.filter((_, idx) => idx !== i) : prev));

  const balanceCents = cents(info?.balance);
  const assignedCents = installments.reduce((s, i) => s + cents(i.amount), 0);
  const remainingCents = balanceCents - assignedCents;

  const splitEvenly = () => {
    const n = installments.length;
    const base = Math.floor(balanceCents / n);
    setInstallments(prev => prev.map((inst, idx) => ({ ...inst, amount: ((idx === n - 1 ? balanceCents - base * (n - 1) : base) / 100).toFixed(2) })));
  };

  const handleSubmit = async () => {
    setError('');
    if (!paymentMethod) { setError('Please choose a payment method.'); return; }
    if (requestType === 'ptp' && !selectedDate) { setError('Please choose a payment date.'); return; }
    if (requestType === 'payment_plan') {
      if (installments.some(i => !i.date || !i.amount)) { setError('Please complete every payment.'); return; }
      if (new Set(installments.map(i => i.date)).size !== installments.length) { setError('Each payment needs its own date.'); return; }
      if (remainingCents !== 0) { setError('Your payments must add up to the full balance.'); return; }
    }
    setSubmitting(true);
    try {
      // Only choices are sent. The server uses the verified account and the balance on file, never what is typed here.
      const res = await fetch(`${API_URL}/api/ptp-requests/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          request_type: requestType,
          requested_date: requestType === 'ptp' ? selectedDate : null,
          payment_method: paymentMethod,
          notes: notes.trim() || null,
          installments: requestType === 'payment_plan' ? installments.map(i => ({ date: i.date, amount: i.amount })) : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Submission failed.');
        if (res.status === 409) await loadInfo(); // something changed since the screen loaded
        setSubmitting(false);
        return;
      }
      setDone(data.routed ? 'routed' : 'submitted');
      setSelectedDate(''); setPaymentMethod(''); setNotes('');
      setInstallments([{ date: '', amount: '' }, { date: '', amount: '' }]);
      await Promise.all([loadInfo(), loadRequests()]);
    } catch {
      setError('Could not connect to server.');
    }
    setSubmitting(false);
  };

  const statusColor = { pending: '#f59e0b', approved: '#22c55e', countered: '#3b82f6', declined: '#ef4444' };
  const statusLabel = { pending: 'Pending Review', approved: 'Approved', countered: 'Countered', declined: 'Declined' };

  const Notice = ({ title, text, tone = 'info' }) => {
    const c = tone === 'ok' ? ['#f0fdf4', '#22c55e', '#15803d', '#166534'] : ['#f0f4ff', '#1B3A6B', '#1B3A6B', '#374151'];
    return (
      <div style={{ backgroundColor: c[0], border: `2px solid ${c[1]}`, borderRadius: '12px', padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ fontWeight: '700', color: c[2], fontSize: '14px', marginBottom: text ? '4px' : 0 }}>{title}</div>
        {text && <div style={{ fontSize: '13px', color: c[3] }}>{text}</div>}
      </div>
    );
  };

  const renderNew = () => {
    if (loadingInfo) return <div style={{ ...card, textAlign: 'center', color: '#64748b' }}>Loading...</div>;
    if (loadFailed || !info) {
      return (
        <div style={{ ...card, textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#374151', marginBottom: '12px' }}>We could not load this page. Please try again.</div>
          <button onClick={() => { setLoadingInfo(true); loadInfo(); }} style={{ padding: '10px 20px', backgroundColor: '#1B3A6B', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Try again</button>
        </div>
      );
    }
    if (info.state !== 'open') {
      return (
        <div>
          {done === 'submitted' && <Notice tone="ok" title="Request submitted" text="Your property manager will review it and respond within 1 business day. You can follow it under My Requests." />}
          {done !== 'submitted' && <Notice title={info.state === 'blocked' ? 'Request in progress' : info.state === 'no_balance' ? 'Nothing to promise' : 'Handled by our accounts team'} text={info.message} />}
        </div>
      );
    }
    const dates = info.dates || [];
    return (
      <div style={{ maxWidth: '600px' }}>
        {error && <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#991b1b' }}>{error}</div>}

        {/* Balance: from the ledger, read-only */}
        <div style={card}>
          <div style={label}>Balance on your account</div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#1B3A6B' }}>{money(info.balance)}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
            Payments must be made by {day(info.window?.end, { month: 'long', day: 'numeric' })}. This is the amount on file with your property.
          </div>
        </div>

        {dates.length === 0 ? (
          <div style={{ backgroundColor: '#fef9c3', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#854d0e', marginBottom: '16px' }}>
            No dates are open this month. Please contact your property manager.
          </div>
        ) : (
          <>
            <div style={card}>
              <div style={label}>Request Type</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { key: 'ptp', label: 'Promise to Pay', desc: 'Pay the full balance on one date', icon: '📅' },
                  { key: 'payment_plan', label: 'Payment Plan', desc: `Split into 2 to ${maxInst} payments`, icon: '📊' },
                ].map(opt => (
                  <div key={opt.key} onClick={() => { setRequestType(opt.key); setError(''); }}
                    style={{ border: requestType === opt.key ? '2px solid #1B3A6B' : '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', cursor: 'pointer', backgroundColor: requestType === opt.key ? '#f0f4ff' : '#F0F4F8' }}>
                    <div style={{ fontSize: '22px', marginBottom: '6px' }}>{opt.icon}</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827', marginBottom: '2px' }}>{opt.label}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>{opt.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {requestType === 'ptp' && (
              <div style={card}>
                <div style={label}>Payment Date</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {dates.map(date => {
                    const sel = selectedDate === date;
                    return (
                      <button key={date} onClick={() => setSelectedDate(date)}
                        style={{ padding: '8px 14px', borderRadius: '8px', border: sel ? '2px solid #1B3A6B' : '1px solid #e2e8f0', backgroundColor: sel ? '#1B3A6B' : '#fff', color: sel ? '#fff' : '#374151', fontSize: '12px', fontWeight: sel ? '700' : '400', cursor: 'pointer' }}>
                        {day(date)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {requestType === 'payment_plan' && (
              <div style={card}>
                <div style={label}>Payment Schedule</div>
                {installments.map((inst, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 36px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <select value={inst.date} onChange={e => updateInstallment(i, 'date', e.target.value)}
                      style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#111827', backgroundColor: '#fff' }}>
                      <option value="">Choose a date</option>
                      {dates.map(d => <option key={d} value={d}>{day(d)}</option>)}
                    </select>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}>$</span>
                      <input type="number" inputMode="decimal" min="0" step="0.01" value={inst.amount} onChange={e => updateInstallment(i, 'amount', e.target.value)} placeholder="0.00"
                        style={{ width: '100%', padding: '10px 10px 10px 22px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }} />
                    </div>
                    {installments.length > 2 ? (
                      <button onClick={() => removeInstallment(i)} aria-label="Remove payment"
                        style={{ width: '36px', height: '36px', border: 'none', borderRadius: '8px', backgroundColor: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}>×</button>
                    ) : <span />}
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
                  {installments.length < maxInst && (
                    <button onClick={addInstallment}
                      style={{ padding: '8px 14px', border: '1px dashed #cbd5e1', borderRadius: '8px', backgroundColor: 'transparent', color: '#1B3A6B', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>+ Add payment</button>
                  )}
                  <button onClick={splitEvenly}
                    style={{ padding: '8px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: 'transparent', color: '#1B3A6B', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Split evenly</button>
                  <span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: '600', color: remainingCents === 0 ? '#15803d' : '#b45309' }}>
                    {remainingCents === 0 ? 'Adds up to your balance' : remainingCents > 0 ? `${money(remainingCents / 100)} left to assign` : `${money(-remainingCents / 100)} over your balance`}
                  </span>
                </div>
              </div>
            )}

            <div style={card}>
              <div style={label}>Payment Method</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {(info.methods || []).map(method => (
                  <button key={method} onClick={() => setPaymentMethod(method)}
                    style={{ padding: '10px 8px', borderRadius: '8px', border: paymentMethod === method ? '2px solid #1B3A6B' : '1px solid #e2e8f0', backgroundColor: paymentMethod === method ? '#f0f4ff' : '#F0F4F8', color: paymentMethod === method ? '#1B3A6B' : '#374151', fontSize: '12px', fontWeight: paymentMethod === method ? '700' : '400', cursor: 'pointer' }}>
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ ...card, marginBottom: '20px' }}>
              <div style={label}>Notes (optional)</div>
              <MicTextarea value={notes} onChange={setNotes} placeholder="Anything your property manager should know..." height={88} fontSize={13} border="1px solid #e2e8f0" radius="8px" />
            </div>

            <button onClick={handleSubmit} disabled={submitting}
              style={{ width: '100%', padding: '14px', backgroundColor: '#1B3A6B', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Submitting...' : 'Submit Request →'}
            </button>
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
              Your property manager will review and respond within 1 business day.
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800', color: '#111827' }}>🤝 Promise to Pay</h2>
        <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Pick a payment date or set up a short payment plan. All payments are due by the 20th.</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[['new', '➕ New Request'], ['history', '📋 My Requests']].map(([key, text]) => (
          <button key={key} onClick={() => setView(key)}
            style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', backgroundColor: view === key ? '#1B3A6B' : '#f1f5f9', color: view === key ? '#fff' : '#475569' }}>
            {text}
          </button>
        ))}
      </div>

      {view === 'new' && (
        renderNew()
      )}

      {view === 'history' && (
        <div>
          {loadingRequests ? (
            <div style={{ ...card, padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading...</div>
          ) : myRequests.length === 0 ? (
            <div style={{ ...card, padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🤝</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>No requests yet</div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Your submitted payment requests will appear here.</div>
            </div>
          ) : myRequests.map(req => {
            const insts = req.installments ? (typeof req.installments === 'string' ? JSON.parse(req.installments) : req.installments) : null;
            return (
              <div key={req.id} style={{ ...card, padding: '18px 20px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>{req.request_type === 'payment_plan' ? '📊 Payment Plan' : '📅 Promise to Pay'}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                      Submitted {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', backgroundColor: (statusColor[req.status] || '#94a3b8') + '20', color: statusColor[req.status] || '#94a3b8', border: '1px solid ' + (statusColor[req.status] || '#94a3b8') + '40' }}>
                    {statusLabel[req.status] || req.status}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#1B3A6B', marginTop: '2px' }}>{money(req.requested_amount)}</div>
                  </div>
                  {req.requested_date && !insts && (
                    <div>
                      <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginTop: '2px' }}>{day(req.requested_date, { month: 'short', day: 'numeric' })}</div>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Method</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginTop: '2px' }}>{req.payment_method || '—'}</div>
                  </div>
                </div>
                {insts && (
                  <div style={{ marginTop: '12px', fontSize: '12px', color: '#374151' }}>
                    {insts.map((i, idx) => <div key={idx}>{day(i.date, { month: 'short', day: 'numeric' })}: {money(i.amount)}</div>)}
                  </div>
                )}
                {req.coordinator_notes && (
                  <div style={{ marginTop: '12px', backgroundColor: '#f0f4ff', borderRadius: '8px', padding: '10px 12px', borderLeft: '3px solid #1B3A6B' }}>
                    <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Manager Response</div>
                    <div style={{ fontSize: '13px', color: '#374151' }}>{req.coordinator_notes}</div>
                    {req.counter_date && (
                      <div style={{ fontSize: '12px', color: '#1B3A6B', fontWeight: '600', marginTop: '4px' }}>
                        Counter date: {day(req.counter_date, { month: 'short', day: 'numeric' })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PTPPortal;
