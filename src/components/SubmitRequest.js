import React, { useState } from 'react';
import FloorplanPicker from './FloorplanPicker';

const API_URL = process.env.REACT_APP_API_URL;

const CATEGORIES = [
  { label: 'HVAC', icon: '❄️' },
  { label: 'Plumbing', icon: '💧' },
  { label: 'Electrical', icon: '⚡' },
  { label: 'Appliance', icon: '🫧' },
  { label: 'General', icon: '🔧' },
  { label: 'Doors', icon: '🚪' }
];

const TIME_OPTIONS = [
  'Any time — urgent',
  'Morning (8am–12pm)',
  'Afternoon (12pm–5pm)',
  'Evening (5pm–8pm)'
];

function SubmitRequest({ token, resident, onSubmit }) {
  const [category, setCategory] = useState('');
  const [locationData, setLocationData] = useState(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [description, setDescription] = useState('');
  const [preferredTime, setPreferredTime] = useState('Any time — urgent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setError('Voice input not supported on this browser.'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setDescription(prev => prev ? prev + ' ' + transcript : transcript);
    };
    recognition.onerror = () => { setListening(false); };
    recognition.onend = () => setListening(false);
    recognition.start();
  };
  const [listening, setListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setError('Voice input not supported on this browser.'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setDescription(prev => prev ? prev + ' ' + transcript : transcript);
    };
    recognition.onerror = () => { setListening(false); };
    recognition.onend = () => setListening(false);
    recognition.start();
  };
  const [listening, setListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setError('Voice input not supported on this browser.'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setDescription(prev => prev ? prev + ' ' + transcript : transcript);
    };
    recognition.onerror = () => { setListening(false); };
    recognition.onend = () => setListening(false);
    recognition.start();
  };
  const [listening, setListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setError('Voice input not supported on this browser.'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setDescription(prev => prev ? prev + ' ' + transcript : transcript);
    };
    recognition.onerror = () => { setListening(false); };
    recognition.onend = () => setListening(false);
    recognition.start();
  };
  const [listening, setListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setError('Voice input not supported on this browser.'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setDescription(prev => prev ? prev + ' ' + transcript : transcript);
    };
    recognition.onerror = () => { setListening(false); };
    recognition.onend = () => setListening(false);
    recognition.start();
  };
  const [listening, setListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setError('Voice input not supported on this browser.'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setDescription(prev => prev ? prev + ' ' + transcript : transcript);
    };
    recognition.onerror = () => { setListening(false); };
    recognition.onend = () => setListening(false);
    recognition.start();
  };
  const [listening, setListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setError('Voice input not supported on this browser.'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setDescription(prev => prev ? prev + ' ' + transcript : transcript);
    };
    recognition.onerror = () => { setListening(false); };
    recognition.onend = () => setListening(false);
    recognition.start();
  };
  const [listening, setListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setError('Voice input not supported on this browser.'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setDescription(prev => prev ? prev + ' ' + transcript : transcript);
    };
    recognition.onerror = () => { setListening(false); };
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const handleLocationSelect = (data) => {
    setLocationData(data);
    setLocationConfirmed(true);
  };

  const handleLocationSkip = () => {
    setLocationData(null);
    setLocationConfirmed(true);
  };

  const handleSubmit = async () => {
    if (!category) { setError('Please select a category.'); return; }
    if (!description.trim()) { setError('Please describe the problem.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/residents/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          category,
          description,
          preferred_time: preferredTime,
          location_room: locationData?.location_room || null,
          location_spot: locationData?.location_spot || null,
          location_pin_x: locationData?.location_pin_x || null,
          location_pin_y: locationData?.location_pin_y || null
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit request.');
        setLoading(false);
        return;
      }
      setCategory('');
      setLocationData(null);
      setLocationConfirmed(false);
      setDescription('');
      setPreferredTime('Any time — urgent');
      onSubmit(data.request, data.rvc_code);
    } catch (err) {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#991b1b' }}>
          {error}
        </div>
      )}

      {/* Unit number (read only) */}
      <div>
        <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>Unit number</label>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#6b7280', background: '#f9fafb' }}>
          {resident.unit_number} — {resident.property_name}
        </div>
      </div>

      {/* Category */}
      <div>
        <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '6px' }}>What's the issue?</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
          {CATEGORIES.map(cat => (
            <div
              key={cat.label}
              onClick={() => { setCategory(cat.label); setLocationConfirmed(false); setLocationData(null); }}
              style={{
                border: category === cat.label ? '1.5px solid #14B8A6' : '1px solid #e5e7eb',
                background: category === cat.label ? '#e1f5ee' : '#f9fafb',
                borderRadius: '8px',
                padding: '8px 4px',
                textAlign: 'center',
                cursor: 'pointer',
                fontSize: '11px',
                color: category === cat.label ? '#0F6E56' : '#374151',
                fontWeight: category === cat.label ? '500' : '400'
              }}
            >
              <div style={{ fontSize: '18px', marginBottom: '3px' }}>{cat.icon}</div>
              {cat.label}
            </div>
          ))}
        </div>
      </div>

      {/* Floorplan picker — shown once category is selected */}
      {category && !locationConfirmed && (
        <div>
          <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '6px' }}>
            Where in your unit?
          </label>
          <FloorplanPicker
            onSelect={handleLocationSelect}
            onSkip={handleLocationSkip}
          />
        </div>
      )}

      {/* Location confirmed summary */}
      {locationConfirmed && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: locationData ? '#E1F5EE' : '#f9fafb', border: `1px solid ${locationData ? '#14B8A6' : '#e5e7eb'}`, borderRadius: '8px', padding: '10px 12px' }}>
          <div style={{ fontSize: '13px', color: locationData ? '#0F6E56' : '#6b7280' }}>
            {locationData
              ? `📍 ${locationData.location_room} — ${locationData.location_spot}`
              : '📍 No location selected'}
          </div>
          <button
            onClick={() => { setLocationConfirmed(false); setLocationData(null); }}
            style={{ background: 'none', border: 'none', fontSize: '12px', color: '#6b7280', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Change
          </button>
        </div>
      )}

      {/* Description — only shown after location step is resolved */}
      {locationConfirmed && (
        <div>
          <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>Describe the problem</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Tell us what's happening..."
            style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', height: '80px', resize: 'none', boxSizing: 'border-box' }}
          />
          <button
            onClick={startListening}
            disabled={listening}
            style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', background: listening ? '#fef2f2' : '#f3f4f6', border: `1px solid ${listening ? '#fca5a5' : '#d1d5db'}`, borderRadius: '8px', padding: '8px 14px', fontSize: '13px', color: listening ? '#991b1b' : '#374151', cursor: listening ? 'default' : 'pointer', width: '100%', justifyContent: 'center' }}
          >
            <span style={{ fontSize: '16px' }}>{listening ? '🔴' : '🎙️'}</span>
            {listening ? 'Listening...' : 'Tap to speak'}
          </button>
        </div>
      )}

      {/* Preferred time — only shown after location step is resolved */}
      {locationConfirmed && (
        <div>
          <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>Best time for us to come?</label>
          <select
            value={preferredTime}
            onChange={e => setPreferredTime(e.target.value)}
            style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '9px 12px', fontSize: '13px' }}
          >
            {TIME_OPTIONS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      )}

      {/* Submit — only shown after location step is resolved */}
      {locationConfirmed && (
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: '100%', background: '#1B3A6B', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '500', opacity: loading ? 0.7 : 1, cursor: loading ? 'default' : 'pointer' }}
        >
          {loading ? 'Submitting...' : 'Submit request →'}
        </button>
      )}

      <div style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
        We'll confirm within 30 minutes and send your verification code.
      </div>
    </div>
  );
}

export default SubmitRequest;