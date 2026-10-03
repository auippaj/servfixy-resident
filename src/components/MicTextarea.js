import React, { useState, useRef, useEffect } from 'react';

// Text box with a built-in mic button (browser speech recognition; button hidden where unsupported).
function MicTextarea({ value, onChange, placeholder, height = 84, fontSize = 15, border = '1px solid #cbd5e1', radius = '10px' }) {
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState('');
  const recRef = useRef(null);
  const SpeechRec = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

  useEffect(() => () => { if (recRef.current) { try { recRef.current.stop(); } catch (e) { /* already stopped */ } } }, []);

  const toggle = () => {
    if (listening) { try { recRef.current.stop(); } catch (e) { /* already stopped */ } setListening(false); return; }
    setMicError('');
    const rec = new SpeechRec();
    rec.lang = navigator.language || 'en-US';
    rec.interimResults = true;
    rec.continuous = false;
    const base = value && value.trim() ? value.trim() + ' ' : '';
    rec.onresult = (e) => {
      let spoken = '';
      for (let i = 0; i < e.results.length; i++) spoken += e.results[i][0].transcript;
      onChange(base + spoken);
    };
    rec.onerror = (e) => {
      setListening(false);
      setMicError(e.error === 'not-allowed' ? 'Please allow microphone access, or type instead.' : 'We could not hear you. Please try again or type instead.');
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    try { rec.start(); setListening(true); } catch (e) { setListening(false); }
  };

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <textarea value={value} onChange={e => onChange(e.target.value)}
          placeholder={listening ? 'Listening... go ahead and speak' : placeholder}
          style={{ width: '100%', boxSizing: 'border-box', height: `${height}px`, padding: '12px 60px 12px 12px', border: listening ? '2px solid #ef4444' : border,
            borderRadius: radius, fontSize: `${fontSize}px`, resize: 'none', fontFamily: 'inherit', color: '#374151' }} />
        {SpeechRec && (
          <button type="button" onClick={toggle} aria-label={listening ? 'Stop listening' : 'Speak instead of typing'}
            style={{ position: 'absolute', right: '10px', bottom: '10px', width: '44px', height: '44px', borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: '20px',
              background: listening ? '#ef4444' : '#1B3A6B', color: '#fff' }}>
            {listening ? '⏹' : '🎤'}
          </button>
        )}
      </div>
      {micError && <div style={{ color: '#991b1b', fontSize: '13px', marginTop: '8px' }}>{micError}</div>}
    </div>
  );
}

export default MicTextarea;
