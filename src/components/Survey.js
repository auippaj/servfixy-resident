import React, { useState, useEffect, useRef } from 'react';

const API = 'https://servfixy-production.up.railway.app/api';
const GOOGLE_REVIEW_URL = 'https://g.page/r/YOUR_REVIEW_LINK/review';

export default function Survey() {
  const [srId, setSrId] = useState(null);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [listening, setListening] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) { setError('Invalid survey link.'); setLoading(false); return; }
    setSrId(id);
    fetch(`${API}/service-requests/${id}/survey-info`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError('Survey not found.'); return; }
        if (data.gate3_survey_submitted) { setAlreadyDone(true); return; }
        setInfo(data);
      })
      .catch(() => setError('Failed to load survey.'))
      .finally(() => setLoading(false));
  }, []);

  const toggleMic = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported on this browser.'); return; }
    const r = new SR();
    r.lang = 'en-US';
    r.continuous = true;
    r.interimResults = false;
    r.onresult = (e) => {
      const transcript = Array.from(e.results).map(x => x[0].transcript).join(' ');
      setFeedback(prev => prev ? prev + ' ' + transcript : transcript);
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    recognitionRef.current = r;
    r.start();
    setListening(true);
  };

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
    try {
      await fetch(`${API}/service-requests/${srId}/survey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          feedback_text: feedback,
          resident_id: info?.resident_id || null
        })
      });
      setSubmitted(true);
    } catch {
      alert('Failed to submit. Please try again.');
    }
    setSubmitting(false);
  };

  const starLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];
  const activeRating = hovered || rating;

  if (loading) return (
    <div style={styles.centered}>
      <div style={styles.spinner}>⏳</div>
      <div style={styles.loadingText}>Loading your survey...</div>
    </div>
  );

  if (error) return (
    <div style={styles.centered}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
      <div style={styles.errorText}>{error}</div>
    </div>
  );

  if (alreadyDone) return (
    <div style={styles.centered}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
      <div style={styles.heading}>Already submitted</div>
      <div style={styles.subtext}>Thanks — we already have your feedback for this request.</div>
    </div>
  );

  // Post-submit screen
  if (submitted) {
    if (rating >= 4) return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
            <div style={{ fontSize: '56px', marginBottom: '12px' }}>🌟</div>
            <div style={styles.heading}>Thank you, {info?.unit_number ? `Unit ${info.unit_number}` : 'neighbor'}!</div>
            <div style={styles.subtext}>We're thrilled you had a great experience.</div>
          </div>
          <div style={{ backgroundColor: '#f0fdf4', borderRadius: '14px', padding: '20px', border: '2px solid #22c55e', textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#15803d', marginBottom: '6px' }}>Mind sharing on Google?</div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px', lineHeight: '1.5' }}>
              It helps other residents find quality maintenance service and takes less than a minute.
            </div>
            <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer" style={styles.googleBtn}>
              ⭐ Leave a Google Review
            </a>
          </div>
          <div style={{ textAlign: 'center', fontSize: '13px', color: '#9ca3af', marginTop: '8px' }}>
            No thanks — <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => window.close()}>close this page</span>
          </div>
        </div>
      </div>
    );

    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: '56px', marginBottom: '12px' }}>💬</div>
            <div style={styles.heading}>Feedback received</div>
            <div style={styles.subtext}>
              Thank you for letting us know. Your feedback goes directly to our team and helps us improve.
            </div>
            <div style={{ marginTop: '24px', backgroundColor: '#fef9ec', borderRadius: '12px', padding: '16px', border: '1px solid #fbbf24' }}>
              <div style={{ fontSize: '13px', color: '#92400e', fontWeight: '600' }}>
                We take every concern seriously and a coordinator will review your comments.
              </div>
            </div>
            <div style={{ marginTop: '16px', backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '16px', border: '2px solid #22c55e' }}>
              <div style={{ fontSize: '14px', color: '#15803d', fontWeight: '700' }}>
                ✓ Your maintenance request is now closed
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main survey screen
  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Header */}
        <div style={{ backgroundColor: '#0F2A52', borderRadius: '14px', padding: '20px', marginBottom: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>
            Maintenance Complete
          </div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '4px' }}>
            {info?.property_name}
          </div>
          {info?.unit_number && (
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Unit {info.unit_number}</div>
          )}
          {(info?.tech_first || info?.tech_last) && (
            <div style={{ marginTop: '12px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', display: 'inline-block' }}>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>Your technician</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#14B8A6' }}>
                {info.tech_first} {info.tech_last}
              </div>
            </div>
          )}
        </div>

        {/* Stars */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#0F2A52', marginBottom: '16px' }}>
            How was your service experience?
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '10px' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                style={{
                  fontSize: '40px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transform: activeRating >= star ? 'scale(1.15)' : 'scale(1)',
                  transition: 'transform 0.1s',
                  filter: activeRating >= star ? 'none' : 'grayscale(1) opacity(0.35)',
                  padding: '4px'
                }}
              >
                ⭐
              </button>
            ))}
          </div>
          {activeRating > 0 && (
            <div style={{ fontSize: '14px', fontWeight: '700', color: activeRating >= 4 ? '#15803d' : activeRating === 3 ? '#92400e' : '#dc2626' }}>
              {starLabels[activeRating]}
            </div>
          )}
        </div>

        {/* Comment box */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
            Any comments? <span style={{ fontWeight: '400', color: '#9ca3af' }}>(optional)</span>
          </div>
          <div style={{ position: 'relative' }}>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Tell us about your experience — what went well, or what could be better..."
              style={{
                width: '100%',
                padding: '12px',
                paddingRight: '52px',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                boxSizing: 'border-box',
                height: '110px',
                resize: 'none',
                lineHeight: '1.5',
                fontFamily: 'system-ui, sans-serif'
              }}
            />
            <button
              onClick={toggleMic}
              style={{
                position: 'absolute',
                right: '10px',
                top: '10px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: listening ? '#ef4444' : '#0F2A52',
                color: 'white',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: listening ? '0 0 0 4px rgba(239,68,68,0.3)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {listening ? '⏹' : '🎤'}
            </button>
          </div>
          {listening && (
            <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '6px', fontWeight: '600' }}>
              🎤 Listening... tap stop when done
            </div>
          )}
        </div>

        {/* Technician callout */}
        {(info?.tech_first) && (
          <div style={{ backgroundColor: '#f0f4ff', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px', border: '1px solid #c7d7f5' }}>
            <div style={{ fontSize: '12px', color: '#1B3A6B', fontWeight: '600' }}>
              📋 Your rating will be linked to {info.tech_first}'s performance score
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!rating || submitting}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: rating ? '#0F2A52' : '#d1d5db',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '700',
            cursor: rating ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s'
          }}
        >
          {submitting ? 'Submitting...' : rating ? 'Submit Feedback' : 'Select a rating to continue'}
        </button>

        <div style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '12px' }}>
          Your feedback is confidential and helps us improve service quality.
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '24px 16px',
    fontFamily: 'system-ui, sans-serif'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '18px',
    padding: '24px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
  },
  centered: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: 'system-ui, sans-serif',
    textAlign: 'center'
  },
  heading: { fontSize: '20px', fontWeight: '800', color: '#0F2A52', marginBottom: '8px' },
  subtext: { fontSize: '14px', color: '#6b7280', lineHeight: '1.6' },
  errorText: { fontSize: '16px', color: '#dc2626', fontWeight: '600' },
  loadingText: { fontSize: '14px', color: '#6b7280', marginTop: '12px' },
  spinner: { fontSize: '36px' },
  googleBtn: {
    display: 'inline-block',
    backgroundColor: '#4285F4',
    color: 'white',
    padding: '13px 28px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 2px 8px rgba(66,133,244,0.35)'
  }
};