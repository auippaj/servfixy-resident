import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import SubmitRequest from './SubmitRequest';
import RequestCard from './RequestCard';

const API_URL = process.env.REACT_APP_API_URL;
const GOOGLE_KEY = 'AIzaSyB0HtcdGObY0irWO1sIUVT6e4hdcfdFkL0';
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const PAST_STATUSES = ['completed', 'Completed', 'closed', 'Closed', 'resident_confirmed'];

// ── PTP Portal ────────────────────────────────────────────────────────────────
function PTPPortal({ resident, token }) {
  const [availableDates, setAvailableDates] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loadingDates, setLoadingDates] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [view, setView] = useState('new'); // 'new' | 'history'
  const [requestType, setRequestType] = useState('ptp');
  const [selectedDate, setSelectedDate] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [installments, setInstallments] = useState([{ date: '', amount: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!resident?.property_id) return;
    fetch(`${API_URL}/api/ptp-requests/available-dates?property_id=${resident.property_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { setAvailableDates(data.dates || []); setLoadingDates(false); })
      .catch(() => setLoadingDates(false));
  }, [resident, token]);

  useEffect(() => {
    fetch(`${API_URL}/api/ptp-requests/my-requests`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { setMyRequests(data.requests || []); setLoadingRequests(false); })
      .catch(() => setLoadingRequests(false));
  }, [token, submitted]);

  const addInstallment = () => setInstallments(prev => [...prev, { date: '', amount: '' }]);
  const updateInstallment = (i, field, val) => setInstallments(prev => prev.map((inst, idx) => idx === i ? { ...inst, [field]: val } : inst));
  const removeInstallment = (i) => setInstallments(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    setError('');
    if (requestType === 'ptp' && !selectedDate) { setError('Please select a payment date.'); return; }
    if (!amount) { setError('Please enter the amount.'); return; }
    if (!paymentMethod) { setError('Please select a payment method.'); return; }
    if (requestType === 'payment_plan' && installments.some(i => !i.date || !i.amount)) {
      setError('Please complete all installment fields.'); return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/ptp-requests/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          property_id: resident.property_id,
          resident_name: resident.name,
          unit_number: resident.unit_number,
          request_type: requestType,
          requested_date: requestType === 'ptp' ? selectedDate : null,
          requested_amount: parseFloat(amount),
          payment_method: paymentMethod,
          notes,
          installments: requestType === 'payment_plan' ? installments : null
        })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Submission failed.'); setSubmitting(false); return; }
      setSubmitted(true);
      setSelectedDate(''); setAmount(''); setPaymentMethod(''); setNotes('');
      setInstallments([{ date: '', amount: '' }]);
      setTimeout(() => setSubmitted(false), 5000);
    } catch { setError('Could not connect to server.'); }
    setSubmitting(false);
  };

  const statusColor = { pending: '#f59e0b', approved: '#22c55e', countered: '#3b82f6', declined: '#ef4444' };
  const statusLabel = { pending: 'Pending Review', approved: 'Approved', countered: 'Countered', declined: 'Declined' };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800', color: '#111827' }}>🤝 Promise to Pay</h2>
        <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Request a payment date or set up a payment plan with your property manager.</p>
      </div>

      {/* Sub-tab */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[['new', '➕ New Request'], ['history', '📋 My Requests']].map(([key, label]) => (
          <button key={key} onClick={() => setView(key)}
            style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
              backgroundColor: view === key ? '#1B3A6B' : '#f1f5f9', color: view === key ? '#fff' : '#475569' }}>
            {label}
          </button>
        ))}
      </div>

      {/* NEW REQUEST VIEW */}
      {view === 'new' && (
        <div style={{ maxWidth: '600px' }}>
          {submitted && (
            <div style={{ backgroundColor: '#f0fdf4', border: '2px solid #22c55e', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>✅</span>
              <div>
                <div style={{ fontWeight: '700', color: '#15803d', fontSize: '14px' }}>Request submitted!</div>
                <div style={{ fontSize: '13px', color: '#166534' }}>Your property manager will review and respond shortly.</div>
              </div>
            </div>
          )}

          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#991b1b' }}>{error}</div>
          )}

          {/* Request type */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Request Type</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { key: 'ptp', label: 'Promise to Pay', desc: 'Commit to pay on a specific date', icon: '📅' },
                { key: 'payment_plan', label: 'Payment Plan', desc: 'Split into multiple payments', icon: '📊' }
              ].map(opt => (
                <div key={opt.key} onClick={() => setRequestType(opt.key)}
                  style={{ border: requestType === opt.key ? '2px solid #1B3A6B' : '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', cursor: 'pointer', backgroundColor: requestType === opt.key ? '#f0f4ff' : '#F0F4F8' }}>
                  <div style={{ fontSize: '22px', marginBottom: '6px' }}>{opt.icon}</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827', marginBottom: '2px' }}>{opt.label}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Total Amount Owed</div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontWeight: '700', fontSize: '16px' }}>$</span>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
                style={{ width: '100%', padding: '12px 12px 12px 28px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', fontWeight: '700', color: '#111827', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Date picker (PTP only) */}
          {requestType === 'ptp' && (
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Payment Date</div>
              {loadingDates ? (
                <div style={{ color: '#94a3b8', fontSize: '13px' }}>Loading available dates...</div>
              ) : availableDates.length === 0 ? (
                <div style={{ backgroundColor: '#fef9c3', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#854d0e' }}>
                  No dates available this month. Please contact your property manager.
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {availableDates.map(date => {
                    const d = new Date(date + 'T00:00:00');
                    const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                    const isSelected = selectedDate === date;
                    return (
                      <button key={date} onClick={() => setSelectedDate(date)}
                        style={{ padding: '8px 14px', borderRadius: '8px', border: isSelected ? '2px solid #1B3A6B' : '1px solid #e2e8f0',
                          backgroundColor: isSelected ? '#1B3A6B' : '#fff', color: isSelected ? '#fff' : '#374151',
                          fontSize: '12px', fontWeight: isSelected ? '700' : '400', cursor: 'pointer' }}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Installments (payment plan only) */}
          {requestType === 'payment_plan' && (
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Payment Schedule</div>
              {installments.map((inst, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 36px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <input type="date" value={inst.date} onChange={e => updateInstallment(i, 'date', e.target.value)}
                    style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#111827' }} />
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}>$</span>
                    <input type="number" value={inst.amount} onChange={e => updateInstallment(i, 'amount', e.target.value)} placeholder="0.00"
                      style={{ width: '100%', padding: '10px 10px 10px 22px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                  {installments.length > 1 && (
                    <button onClick={() => removeInstallment(i)}
                      style={{ width: '36px', height: '36px', border: 'none', borderRadius: '8px', backgroundColor: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}>×</button>
                  )}
                </div>
              ))}
              <button onClick={addInstallment}
                style={{ marginTop: '4px', padding: '8px 14px', border: '1px dashed #cbd5e1', borderRadius: '8px', backgroundColor: 'transparent', color: '#1B3A6B', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                + Add Installment
              </button>
            </div>
          )}

          {/* Payment method */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Payment Method</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {['Online Portal', 'Check', 'Money Order', 'Cashiers Check', 'ACH', 'Other'].map(method => (
                <button key={method} onClick={() => setPaymentMethod(method)}
                  style={{ padding: '10px 8px', borderRadius: '8px', border: paymentMethod === method ? '2px solid #1B3A6B' : '1px solid #e2e8f0',
                    backgroundColor: paymentMethod === method ? '#f0f4ff' : '#F0F4F8',
                    color: paymentMethod === method ? '#1B3A6B' : '#374151',
                    fontSize: '12px', fontWeight: paymentMethod === method ? '700' : '400', cursor: 'pointer' }}>
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Notes (optional)</div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Any additional context for your property manager..."
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#374151', height: '80px', resize: 'none', boxSizing: 'border-box' }} />
          </div>

          <button onClick={handleSubmit} disabled={submitting}
            style={{ width: '100%', padding: '14px', backgroundColor: '#1B3A6B', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
            {submitting ? 'Submitting...' : 'Submit Request →'}
          </button>

          <div style={{ marginTop: '12px', fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
            Your property manager will review and respond within 1 business day.
          </div>
        </div>
      )}

      {/* HISTORY VIEW */}
      {view === 'history' && (
        <div>
          {loadingRequests ? (
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#94a3b8', border: '1px solid #e2e8f0' }}>Loading...</div>
          ) : myRequests.length === 0 ? (
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '48px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🤝</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>No requests yet</div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Your submitted payment requests will appear here.</div>
            </div>
          ) : myRequests.map(req => (
            <div key={req.id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px 20px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>
                    {req.request_type === 'payment_plan' ? '📊 Payment Plan' : '📅 Promise to Pay'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    Submitted {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                  backgroundColor: (statusColor[req.status] || '#94a3b8') + '20',
                  color: statusColor[req.status] || '#94a3b8', border: '1px solid ' + (statusColor[req.status] || '#94a3b8') + '40' }}>
                  {statusLabel[req.status] || req.status}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#1B3A6B', marginTop: '2px' }}>
                    ${parseFloat(req.requested_amount || 0).toFixed(2)}
                  </div>
                </div>
                {req.requested_date && (
                  <div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginTop: '2px' }}>
                      {new Date(req.requested_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Method</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginTop: '2px' }}>{req.payment_method || '—'}</div>
                </div>
              </div>
              {req.coordinator_notes && (
                <div style={{ marginTop: '12px', backgroundColor: '#f0f4ff', borderRadius: '8px', padding: '10px 12px', borderLeft: '3px solid #1B3A6B' }}>
                  <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Manager Response</div>
                  <div style={{ fontSize: '13px', color: '#374151' }}>{req.coordinator_notes}</div>
                  {req.counter_date && (
                    <div style={{ fontSize: '12px', color: '#1B3A6B', fontWeight: '600', marginTop: '4px' }}>
                      Counter date: {new Date(req.counter_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── My Neighborhood ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'restaurant', label: 'Eateries', icon: '🍽️', type: 'restaurant' },
  { key: 'school', label: 'Schools', icon: '🏫', type: 'school' },
  { key: 'church', label: 'Worship', icon: '⛪', type: 'church' },
  { key: 'grocery_or_supermarket', label: 'Grocery', icon: '🛒', type: 'grocery_or_supermarket' },
  { key: 'hospital', label: 'Healthcare', icon: '🏥', type: 'hospital|pharmacy|doctor' },
  { key: 'park', label: 'Parks', icon: '🌳', type: 'park' },
  { key: 'gym', label: 'Fitness', icon: '💪', type: 'gym' },
  { key: 'bank', label: 'Banking', icon: '🏦', type: 'bank|atm' },
  { key: 'laundry', label: 'Services', icon: '💇', type: 'laundry|hair_care|car_repair' },
  { key: 'transit_station', label: 'Transit', icon: '🚌', type: 'transit_station|bus_station' },
];

function MyNeighborhood({ resident }) {
  const [activeCategory, setActiveCategory] = useState('restaurant');
  const [places, setPlaces] = useState({});
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);

  // Approximate lat/lng from property name for demo (Houston properties)
  // In production this comes from properties table
  const propertyCoords = { lat: 29.7604, lng: -95.3698 }; // Houston default

  const fetchPlaces = (categoryKey) => {
    const cat = CATEGORIES.find(c => c.key === categoryKey);
    if (!cat || places[categoryKey]) return;
    setLoading(true);

    // Use Google Places Nearby Search via proxy to avoid CORS
    // We call it through our backend to keep the API key server-side safe
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${propertyCoords.lat},${propertyCoords.lng}&radius=2000&type=${cat.type.split('|')[0]}&key=${GOOGLE_KEY}`;

    // Since we can't call Google directly from browser (CORS), use a text search approach
    const textUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(cat.label + ' near ' + (resident.property_address || resident.property_name + ' Houston TX'))}&key=${GOOGLE_KEY}`;

    // Fallback: use Google Maps Embed or Places JS API approach
    // For now build cards from a structured mock that we'll replace with real API
    // We'll use the Nearby Search through the backend proxy
    fetch(`${process.env.REACT_APP_API_URL}/api/neighborhood?type=${encodeURIComponent(cat.type)}&property_name=${encodeURIComponent(resident.property_name || 'Houston TX')}`)
      .then(r => r.json())
      .then(data => {
        setPlaces(prev => ({ ...prev, [categoryKey]: data.results || [] }));
        setLoading(false);
      })
      .catch(() => {
        setPlaces(prev => ({ ...prev, [categoryKey]: [] }));
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPlaces(activeCategory);
  }, [activeCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const stars = (rating) => {
    if (!rating) return '';
    const full = Math.floor(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  };

  const activeCat = CATEGORIES.find(c => c.key === activeCategory);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800', color: '#111827' }}>🏘️ My Neighborhood</h2>
        <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Discover what's around {resident.property_name}.</p>
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {CATEGORIES.map(cat => (
          <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
            style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px',
              backgroundColor: activeCategory === cat.key ? '#1B3A6B' : '#fff',
              color: activeCategory === cat.key ? '#fff' : '#374151',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <span>{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ backgroundColor: '#fff', borderRadius: '12px', height: '140px', border: '1px solid #e2e8f0',
              background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
              backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
          ))}
        </div>
      ) : !places[activeCategory] || places[activeCategory].length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '48px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>{activeCat?.icon}</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>No results found</div>
          <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Try searching on Google Maps for {activeCat?.label} near you.</div>
          <a href={`https://maps.google.com/?q=${encodeURIComponent(activeCat?.label + ' near ' + (resident.property_name || '') + ' Houston TX')}`}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-block', marginTop: '16px', padding: '10px 20px', backgroundColor: '#1B3A6B', color: '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>
            Open Google Maps →
          </a>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {places[activeCategory].map((place, i) => (
            <div key={i} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              {place.photo_url && (
                <img src={place.photo_url} alt={place.name}
                  style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
              )}
              {!place.photo_url && (
                <div style={{ height: '80px', background: 'linear-gradient(135deg, #1B3A6B20, #14B8A620)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>
                  {activeCat?.icon}
                </div>
              )}
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place.name}</div>
                {place.vicinity && (
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📍 {place.vicinity}</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {place.rating && (
                      <>
                        <span style={{ color: '#f59e0b', fontSize: '12px' }}>{stars(place.rating)}</span>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{place.rating}</span>
                        {place.user_ratings_total && <span style={{ fontSize: '11px', color: '#94a3b8' }}>({place.user_ratings_total})</span>}
                      </>
                    )}
                    {place.open_now !== undefined && (
                      <span style={{ fontSize: '11px', fontWeight: '700', color: place.open_now ? '#22c55e' : '#ef4444' }}>
                        {place.open_now ? '● Open' : '● Closed'}
                      </span>
                    )}
                  </div>
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(place.name + ' ' + (place.vicinity || ''))}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: '12px', fontWeight: '600', color: '#1B3A6B', textDecoration: 'none', padding: '4px 10px', border: '1px solid #1B3A6B', borderRadius: '6px' }}>
                    Directions
                  </a>
                </div>
                {place.distance && (
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>{place.distance} away</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
function Dashboard({ resident, token, onLogout }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRequest, setActiveRequest] = useState(null);
  const [rvcData, setRvcData] = useState(null);
  const [pendingSurvey, setPendingSurvey] = useState(null);
  const [activeTab, setActiveTab] = useState('requests');
  const [videoRoom, setVideoRoom] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const videoRef = useRef(null); // eslint-disable-line no-unused-vars

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/residents/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.requests) {
        setRequests(data.requests);
        setActiveRequest(prev => {
          if (!prev) return data.requests.length > 0 ? data.requests[0] : null;
          const updated = data.requests.find(r => r.id === prev.id);
          return updated || prev;
        });
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  useEffect(() => {
    const channel = supabase
      .channel('resident-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' }, () => { fetchRequests(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'touchpoints' }, () => { fetchRequests(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!resident?.id) return;
    fetch(`${API_URL}/api/surveys/pending/${resident.id}`)
      .then(r => r.json())
      .then(data => { if (data.pending) setPendingSurvey(data.survey); })
      .catch(() => {});
  }, [resident]);

  useEffect(() => {
    const handleVideoCall = async (e) => {
      const { requestId } = e.detail;
      try {
        const res = await fetch(`${API_URL}/api/video/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ serviceRequestId: requestId, techId: 'resident', techName: resident.name })
        });
        const data = await res.json();
        setVideoRoom({ token: data.token, roomName: data.roomName, requestId });
      } catch (err) {
        console.error('Could not connect to video call.');
      }
    };
    window.addEventListener('resident-video-call', handleVideoCall);
    return () => window.removeEventListener('resident-video-call', handleVideoCall);
  }, [token, resident.name]);

  const handleNewRequest = (newRequest, rvc) => {
    setRvcData({ request: newRequest, rvc });
    fetchRequests();
    setActiveTab('requests');
  };

  const openRequests = requests.filter(r => !PAST_STATUSES.includes(r.status));
  const pastRequests = requests.filter(r => PAST_STATUSES.includes(r.status));
  const initials = resident.name ? resident.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'R';

  const navItems = [
    { key: 'requests', label: 'My Requests', icon: '📋' },
    { key: 'submit', label: 'New Request', icon: '➕' },
    { key: 'history', label: 'History', icon: '🕐' },
    { key: 'ptp', label: 'Promise to Pay', icon: '🤝' },
    { key: 'neighborhood', label: 'My Neighborhood', icon: '🏘️' },
  ];

  const pageTitle = {
    requests: 'My Requests', submit: 'Submit a Request', history: 'Request History',
    ptp: 'Promise to Pay', neighborhood: 'My Neighborhood'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F0F4F8', fontFamily: 'Arial, sans-serif' }}>

      {/* Left Sidebar -- desktop only */}
      {!isMobile && <div style={{ width: '240px', minWidth: '240px', backgroundColor: '#1B3A6B', display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 100 }}>
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <img src="https://i.imgur.com/OKIqq0K.png" alt="Servfixy" style={{ width: '160px', height: 'auto' }} />
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Resident Portal</div>
        </div>

        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#14B8A6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>{resident.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Unit {resident.unit_number}</div>
            </div>
          </div>
          <div style={{ marginTop: '10px', background: 'rgba(255,255,255,0.07)', borderRadius: '6px', padding: '8px 10px' }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Property</div>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', marginTop: '2px' }}>{resident.property_name}</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {navItems.map(item => {
            const isActive = activeTab === item.key;
            return (
              <button key={item.key} onClick={() => setActiveTab(item.key)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', marginBottom: '2px',
                  backgroundColor: isActive ? 'rgba(20,184,166,0.15)' : 'transparent',
                  color: isActive ? '#14B8A6' : 'rgba(255,255,255,0.65)',
                  fontSize: '13px', fontWeight: isActive ? '600' : '400', textAlign: 'left' }}>
                <span style={{ fontSize: '15px' }}>{item.icon}</span>
                {item.label}
                {item.key === 'requests' && openRequests.length > 0 && (
                  <span style={{ marginLeft: 'auto', backgroundColor: '#14B8A6', color: '#fff', borderRadius: '10px', fontSize: '10px', fontWeight: '700', padding: '2px 7px' }}>
                    {openRequests.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '16px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={onLogout}
            style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}>
            Sign out
          </button>
        </div>
      </div>}

      {/* Main content */}
      <div style={{ marginLeft: isMobile ? 0 : '240px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: isMobile ? '72px' : 0 }}>

        {isMobile ? (
          <div style={{ backgroundColor: '#1B3A6B', padding: '0 20px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
            <img src="https://i.imgur.com/OKIqq0K.png" alt="Servfixy" style={{ height: '28px', objectFit: 'contain' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#14B8A6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#fff' }}>{initials}</div>
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 28px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>{pageTitle[activeTab]}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Live updates active</span>
            </div>
          </div>
        )}

        <div style={{ flex: 1, padding: isMobile ? '16px' : '28px' }}>

          {/* Survey banner */}
          {pendingSurvey && (
            <div onClick={() => window.location.href = `/survey?id=${pendingSurvey.service_request_id}`}
              style={{ background: 'linear-gradient(135deg, #0F2A52, #1B3A6B)', borderRadius: '12px', padding: '16px 22px', marginBottom: '20px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 16px rgba(15,42,82,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '26px' }}>⭐</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#14B8A6', marginBottom: '2px' }}>How did we do?</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Your recent service request is complete. Rate your experience.</div>
                </div>
              </div>
              <span style={{ fontSize: '20px', color: 'rgba(255,255,255,0.4)', marginLeft: '12px' }}>›</span>
            </div>
          )}

          {/* RVC card */}
          {rvcData && (
            <div style={{ background: '#fff', border: '2px solid #14B8A6', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Request submitted!</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>Show this verification code to your technician at the door.</div>
              </div>
              <div style={{ background: '#F0F4F8', borderRadius: '10px', padding: '14px 24px', textAlign: 'center', minWidth: '140px' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.08em', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>Verification code</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#1B3A6B', letterSpacing: '0.06em' }}>SERV<br />{rvcData.rvc}</div>
              </div>
              <button onClick={() => setRvcData(null)} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', color: '#6b7280', fontSize: '12px', padding: '6px 12px', cursor: 'pointer' }}>Dismiss</button>
            </div>
          )}

          {/* REQUESTS TAB */}
          {activeTab === 'requests' && (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap: '20px', alignItems: 'start' }}>
              <div>
                {loading ? (
                  <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#9ca3af', border: '1px solid #e5e7eb' }}>Loading...</div>
                ) : openRequests.length === 0 ? (
                  <div style={{ background: '#fff', borderRadius: '12px', padding: '48px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>✅</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>No active requests</div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>All clear! Submit a new request if something needs attention.</div>
                    <button onClick={() => setActiveTab('submit')} style={{ marginTop: '16px', background: '#1B3A6B', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Submit a Request</button>
                  </div>
                ) : openRequests.map(r => (
                  <RequestCard key={r.id} request={r} active={activeRequest && activeRequest.id === r.id} onClick={() => setActiveRequest(r)} />
                ))}
              </div>
              {!isMobile && (
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '10px' }}>Quick submit</div>
                <SubmitRequest token={token} resident={resident} onSubmit={handleNewRequest} />
              </div>
              )}
            </div>
          )}

          {activeTab === 'submit' && (
            <div style={{ maxWidth: '620px' }}>
              <SubmitRequest token={token} resident={resident} onSubmit={handleNewRequest} />
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              {pastRequests.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: '12px', padding: '48px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>🕐</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>No past requests</div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Completed requests will appear here.</div>
                </div>
              ) : pastRequests.map(r => (
                <RequestCard key={r.id} request={r} active={activeRequest && activeRequest.id === r.id} onClick={() => setActiveRequest(r)} past />
              ))}
            </div>
          )}

          {activeTab === 'ptp' && <PTPPortal resident={resident} token={token} />}

          {activeTab === 'neighborhood' && <MyNeighborhood resident={resident} />}

        </div>
      </div>


      {/* Mobile bottom tab bar */}
      {isMobile && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '72px', backgroundColor: '#1B3A6B', borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', zIndex: 200 }}>
          {navItems.map(item => {
            const isActive = activeTab === item.key;
            const badge = item.key === 'requests' && openRequests.length > 0 ? openRequests.length : null;
            const shortLabel = item.key === 'neighborhood' ? 'Area' : item.key === 'ptp' ? 'Pay' : item.key === 'requests' ? 'Requests' : item.key === 'submit' ? 'New' : 'History';
            return (
              <button key={item.key} onClick={() => setActiveTab(item.key)}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '8px 4px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: isActive ? '#14B8A6' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: isActive ? '#fff' : 'rgba(255,255,255,0.45)', transition: 'all 0.15s' }}>
                  {item.key === 'requests' ? '=' : item.key === 'submit' ? '+' : item.key === 'history' ? 'H' : item.key === 'ptp' ? '$' : 'N'}
                </div>
                <span style={{ fontSize: '9px', fontWeight: isActive ? '700' : '400', color: isActive ? '#14B8A6' : 'rgba(255,255,255,0.4)', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                  {shortLabel}
                </span>
                {badge && (
                  <div style={{ position: 'absolute', top: '6px', right: '12px', width: '16px', height: '16px', backgroundColor: '#ef4444', borderRadius: '50%', fontSize: '9px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {badge > 9 ? '9+' : badge}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
      {/* Video call overlay */}
      {videoRoom && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#0f1f3d', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#1B3A6B', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#fff', fontWeight: '700', fontSize: '15px' }}>Video Call — Your Technician</span>
            <button onClick={() => setVideoRoom(null)} style={{ background: '#ef4444', border: 'none', borderRadius: '8px', color: '#fff', padding: '8px 16px', fontWeight: '700', cursor: 'pointer' }}>End Call</button>
          </div>
          <ResidentVideoCall token={videoRoom.token} roomName={videoRoom.roomName} onHangUp={() => setVideoRoom(null)} />
        </div>
      )}
    </div>
  );
}

function ResidentVideoCall({ token, roomName, onHangUp }) {
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const roomRef = useRef(null);
  const [connected, setConnected] = useState(false); // eslint-disable-line no-unused-vars

  useEffect(() => {
    let cancelled = false;
    import('twilio-video').then(TwilioVideo => {
      TwilioVideo.connect(token, { name: roomName, audio: true, video: { width: 640 } })
        .then(room => {
          if (cancelled) { room.disconnect(); return; }
          roomRef.current = room;
          setConnected(true);
          room.localParticipant.videoTracks.forEach(pub => {
            if (localRef.current) localRef.current.appendChild(pub.track.attach());
          });
          room.participants.forEach(participant => {
            participant.videoTracks.forEach(pub => {
              if (pub.track && remoteRef.current) remoteRef.current.appendChild(pub.track.attach());
            });
            participant.on('trackSubscribed', track => {
              if (track.kind === 'video' && remoteRef.current) remoteRef.current.appendChild(track.attach());
            });
          });
          room.on('participantConnected', participant => {
            participant.on('trackSubscribed', track => {
              if (track.kind === 'video' && remoteRef.current) remoteRef.current.appendChild(track.attach());
            });
          });
        })
        .catch(() => { if (!cancelled) onHangUp(); });
    });
    return () => {
      cancelled = true;
      if (roomRef.current) { roomRef.current.disconnect(); roomRef.current = null; }
    };
  }, [token, roomName, onHangUp]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', gap: '12px' }}>
      <div ref={remoteRef} style={{ flex: 1, background: '#1a1a2e', borderRadius: '16px', overflow: 'hidden', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Waiting for technician video...</div>
      </div>
      <div ref={localRef} style={{ width: '100px', height: '75px', background: '#1B3A6B', borderRadius: '10px', overflow: 'hidden', alignSelf: 'flex-end', border: '2px solid #14B8A6' }} />
      <button onClick={onHangUp} style={{ width: '100%', background: '#ef4444', border: 'none', borderRadius: '10px', padding: '14px', color: '#fff', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
        End Call
      </button>
    </div>
  );
}

export default Dashboard;
