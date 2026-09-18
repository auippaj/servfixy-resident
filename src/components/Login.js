import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

const STRINGS = {
  en: {
    heading: 'Sign in to Resident Portal',
    email: 'you@example.com',
    password: '••••••••',
    smsOptional: 'Optional:',
    smsText: ' I agree to receive SMS text notifications from Servfixy regarding my maintenance requests, appointment confirmations, and property updates. Message frequency varies (typically 1-5 messages per work order). Message and data rates may apply. Reply ',
    smsStop: 'STOP',
    smsMiddle: ' to opt out at any time, ',
    smsHelp: 'HELP',
    smsEnd: ' for assistance. Mobile information will not be shared with third parties for marketing. See our ',
    privacy: 'Privacy Policy',
    and: ' and ',
    terms: 'Terms of Use',
    signIn: 'Sign In →',
    signingIn: 'Signing in...',
    error: 'Login failed.',
    noConnect: 'Could not connect to server.',
  },
  es: {
    heading: 'Iniciar sesión en el Portal',
    email: 'tu@ejemplo.com',
    password: '••••••••',
    smsOptional: 'Opcional:',
    smsText: ' Acepto recibir notificaciones SMS de Servfixy sobre mis solicitudes de mantenimiento, confirmaciones de citas y actualizaciones de la propiedad. La frecuencia de mensajes varía (generalmente 1-5 por orden de trabajo). Pueden aplicarse tarifas de mensajes y datos. Responde ',
    smsStop: 'STOP',
    smsMiddle: ' para cancelar en cualquier momento, ',
    smsHelp: 'AYUDA',
    smsEnd: ' para asistencia. La información móvil no será compartida con terceros. Consulta nuestra ',
    privacy: 'Política de Privacidad',
    and: ' y ',
    terms: 'Términos de Uso',
    signIn: 'Iniciar Sesión →',
    signingIn: 'Ingresando...',
    error: 'Error al iniciar sesión.',
    noConnect: 'No se pudo conectar al servidor.',
  }
};

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [smsConsent, setSmsConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('en');
  const t = STRINGS[lang];

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/residents/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, smsConsent })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || t.error); setLoading(false); return; }
      onLogin(data.token, data.resident);
    } catch (err) {
      setError(t.noConnect);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', fontFamily: "'Inter', system-ui, sans-serif", padding: '8px 16px' }}>
      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Logo — untouched */}
        <img src="/servfixy-logo.png" alt="Servfixy" style={{ width: '420px', marginBottom: '10px' }} />

        {/* Heading */}
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '16px', alignSelf: 'flex-start' }}>{t.heading}</h1>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '8px 14px', fontSize: '13px', color: '#991b1b', marginBottom: '12px', width: '100%', boxSizing: 'border-box' }}>
            {error}
          </div>
        )}

        {/* Email */}
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={t.email}
          style={{ width: '100%', padding: '12px 18px', border: 'none', borderRadius: '12px', fontSize: '14px', color: '#111827', backgroundColor: '#EEF2F7', boxSizing: 'border-box', marginBottom: '10px', outline: 'none' }}
        />

        {/* Password */}
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder={t.password}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{ width: '100%', padding: '12px 18px', border: 'none', borderRadius: '12px', fontSize: '14px', color: '#111827', backgroundColor: '#EEF2F7', boxSizing: 'border-box', marginBottom: '12px', outline: 'none' }}
        />

        {/* SMS Consent — required for Twilio A2P 10DLC compliance. Must be unchecked by default. */}
        <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #14B8A6', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', width: '100%', boxSizing: 'border-box' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={smsConsent}
              onChange={e => setSmsConsent(e.target.checked)}
              style={{ marginTop: '2px', width: '16px', height: '16px', flexShrink: 0, accentColor: '#14B8A6', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '11px', color: '#134e4a', lineHeight: '1.5' }}>
              <strong>{t.smsOptional}</strong>{t.smsText}<strong>{t.smsStop}</strong>{t.smsMiddle}<strong>{t.smsHelp}</strong>{t.smsEnd}
              <a href="https://servfixy.com/privacy" target="_blank" rel="noreferrer" style={{ color: '#0f766e', textDecoration: 'underline' }}>{t.privacy}</a>{t.and}
              <a href="https://servfixy.com/terms" target="_blank" rel="noreferrer" style={{ color: '#0f766e', textDecoration: 'underline' }}>{t.terms}</a>.
            </span>
          </label>
        </div>

        {/* Sign In + Language toggle */}
        <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ padding: '12px 26px', backgroundColor: '#14B8A6', color: 'white', border: 'none', borderRadius: '50px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? t.signingIn : t.signIn}
          </button>
          {['en', 'es'].map(l => (
            <button key={l} onClick={() => setLang(l)}
              style={{ padding: '8px 16px', border: lang === l ? '2px solid #14B8A6' : '2px solid #e5e7eb', borderRadius: '50px', cursor: 'pointer', backgroundColor: lang === l ? '#14B8A6' : 'transparent', color: lang === l ? '#fff' : '#6b7280', fontWeight: '700', fontSize: '12px' }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Login;
