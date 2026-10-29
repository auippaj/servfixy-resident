import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

const STRINGS = {
  en: {
    heading: 'Sign in to Resident Portal',
    email: 'you@example.com',
    password: '••••••••',
    smsOptional: 'Optional:',
    smsText: ' I agree to receive SMS text notifications from Servfixy regarding my maintenance requests and appointment confirmations. Message frequency varies (typically 1-5 messages per work order). Message and data rates may apply. Reply ',
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
    forgot: 'Forgot password?',
    forgotIntro: 'Enter your email and we will send you a link to choose a new password.',
    sendLink: 'Send Reset Link →',
    sending: 'Sending...',
    backToSignIn: '← Back to sign in',
    newPassword: 'New password',
    confirmPassword: 'Confirm new password',
    pwRules: 'At least 8 characters, with one number and one uppercase letter.',
    mismatch: 'Passwords do not match.',
    saveNewPassword: 'Save New Password →',
    saving: 'Saving...',
    resetDone: 'Your password was updated. Please sign in.',
    resetFail: 'Could not reset your password. Please request a new link.',
    emailNeeded: 'Please enter your email.',
  },
  es: {
    heading: 'Iniciar sesión en el Portal',
    email: 'tu@ejemplo.com',
    password: '••••••••',
    smsOptional: 'Opcional:',
    smsText: ' Acepto recibir notificaciones SMS de Servfixy sobre mis solicitudes de mantenimiento y confirmaciones de citas. La frecuencia de mensajes varía (generalmente 1-5 por orden de trabajo). Pueden aplicarse tarifas de mensajes y datos. Responde ',
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
    forgot: '¿Olvidaste tu contraseña?',
    forgotIntro: 'Ingresa tu correo y te enviaremos un enlace para elegir una nueva contraseña.',
    sendLink: 'Enviar Enlace →',
    sending: 'Enviando...',
    backToSignIn: '← Volver a iniciar sesión',
    newPassword: 'Nueva contraseña',
    confirmPassword: 'Confirmar nueva contraseña',
    pwRules: 'Al menos 8 caracteres, con un número y una letra mayúscula.',
    mismatch: 'Las contraseñas no coinciden.',
    saveNewPassword: 'Guardar Contraseña →',
    saving: 'Guardando...',
    resetDone: 'Tu contraseña fue actualizada. Por favor inicia sesión.',
    resetFail: 'No se pudo restablecer tu contraseña. Solicita un nuevo enlace.',
    emailNeeded: 'Por favor ingresa tu correo.',
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

  // The emailed reset link opens the portal with ?reset_token=...
  const [resetToken] = useState(() => new URLSearchParams(window.location.search).get('reset_token') || '');
  const [mode, setMode] = useState(resetToken ? 'reset' : 'login'); // 'login' | 'forgot' | 'reset'
  const [info, setInfo] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const switchMode = (next) => { setMode(next); setError(''); setInfo(''); setLoading(false); };

  const handleForgot = async () => {
    setError(''); setInfo('');
    if (!email.trim()) { setError(t.emailNeeded); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/residents/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || t.error);
      else setInfo(data.message);
    } catch (err) {
      setError(t.noConnect);
    }
    setLoading(false);
  };

  const handleReset = async () => {
    setError(''); setInfo('');
    if (newPassword !== confirmPassword) { setError(t.mismatch); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/residents/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, new_password: newPassword })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || t.resetFail); setLoading(false); return; }
      window.history.replaceState({}, '', window.location.pathname); // drop the token from the address bar
      setNewPassword(''); setConfirmPassword('');
      setMode('login');
      setInfo(t.resetDone);
    } catch (err) {
      setError(t.noConnect);
    }
    setLoading(false);
  };

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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', fontFamily: "'Inter', system-ui, sans-serif", padding: '4px 16px' }}>
      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Logo — untouched */}
        <img src="https://i.imgur.com/OPDKgyD.png" alt="Servfixy" style={{ width: '420px', marginBottom: '0px' }} />

        {/* Heading */}
        

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '8px 14px', fontSize: '13px', color: '#991b1b', marginBottom: '12px', width: '100%', boxSizing: 'border-box' }}>
            {error}
          </div>
        )}

        {info && (
          <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #14B8A6', borderRadius: '10px', padding: '8px 14px', fontSize: '13px', color: '#134e4a', marginBottom: '12px', width: '100%', boxSizing: 'border-box' }}>
            {info}
          </div>
        )}

        {mode === 'forgot' && (
          <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 12px', width: '100%' }}>{t.forgotIntro}</p>
        )}

        {mode === 'reset' && (
          <>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder={t.newPassword}
              autoComplete="new-password"
              style={{ width: '100%', padding: '12px 18px', border: 'none', borderRadius: '12px', fontSize: '14px', color: '#111827', backgroundColor: '#EEF2F7', boxSizing: 'border-box', marginBottom: '10px', outline: 'none' }}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder={t.confirmPassword}
              autoComplete="new-password"
              onKeyDown={e => e.key === 'Enter' && handleReset()}
              style={{ width: '100%', padding: '12px 18px', border: 'none', borderRadius: '12px', fontSize: '14px', color: '#111827', backgroundColor: '#EEF2F7', boxSizing: 'border-box', marginBottom: '8px', outline: 'none' }}
            />
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px', width: '100%' }}>{t.pwRules}</p>
          </>
        )}

        {/* Email */}
        {mode !== 'reset' && (
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={t.email}
          style={{ width: '100%', padding: '12px 18px', border: 'none', borderRadius: '12px', fontSize: '14px', color: '#111827', backgroundColor: '#EEF2F7', boxSizing: 'border-box', marginBottom: '10px', outline: 'none' }}
        />

        )}

        {mode === 'login' && (
        <>
        {/* Password */}
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder={t.password}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{ width: '100%', padding: '12px 18px', border: 'none', borderRadius: '12px', fontSize: '14px', color: '#111827', backgroundColor: '#EEF2F7', boxSizing: 'border-box', marginBottom: '12px', outline: 'none' }}
        />

        <div style={{ width: '100%', textAlign: 'right', marginTop: '-4px', marginBottom: '12px' }}>
          <button onClick={() => switchMode('forgot')} style={{ background: 'none', border: 'none', padding: 0, color: '#0482FD', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            {t.forgot}
          </button>
        </div>

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

        </>
        )}

        {mode !== 'login' && (
          <div style={{ width: '100%', marginBottom: '12px' }}>
            <button onClick={() => switchMode('login')} style={{ background: 'none', border: 'none', padding: 0, color: '#0482FD', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              {t.backToSignIn}
            </button>
          </div>
        )}

        {/* Sign In + Language toggle */}
        <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={mode === 'forgot' ? handleForgot : mode === 'reset' ? handleReset : handleSubmit}
            disabled={loading}
            style={{ padding: '12px 26px', backgroundColor: '#14B8A6', color: 'white', border: 'none', borderRadius: '50px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {mode === 'forgot' ? (loading ? t.sending : t.sendLink)
              : mode === 'reset' ? (loading ? t.saving : t.saveNewPassword)
              : (loading ? t.signingIn : t.signIn)}
          </button>
          {['en', 'es'].map(l => (
            <button key={l} onClick={() => setLang(l)}
              style={{ padding: '4px 16px', border: lang === l ? '2px solid #14B8A6' : '2px solid #e5e7eb', borderRadius: '50px', cursor: 'pointer', backgroundColor: lang === l ? '#14B8A6' : 'transparent', color: lang === l ? '#fff' : '#6b7280', fontWeight: '700', fontSize: '12px' }}>
              {l.toUpperCase()}
            </button>
          ))}
          <span style={{ fontSize: '22px', fontWeight: '700', color: '#0482FD' }}>Residents</span>
        </div>

      </div>
    </div>
  );
}

export default Login;
