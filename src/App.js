import React, { useState, useEffect } from 'react';
import { registerPushToken, onForegroundMessage } from './firebase';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Survey from './components/Survey';
import './App.css';

const isSurvey = window.location.pathname === '/survey';

function App() {
  const [resident, setResident] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (isSurvey) return;
    const savedToken = localStorage.getItem('residentToken');
    const savedResident = localStorage.getItem('residentData');
    if (savedToken && savedResident) {
      setToken(savedToken);
      setResident(JSON.parse(savedResident));
      // Wait for SW to be ready before registering push token
      const doRegister = async () => {
        try {
          if ('serviceWorker' in navigator) await navigator.serviceWorker.ready;
          await registerPushToken(savedToken);
        } catch (e) { console.warn('[push] mount registration skipped:', e.message); }
      };
      doRegister();
    }
    // Foreground push — show browser notification
    const unsub = onForegroundMessage((payload) => {
      const { title, body } = payload.notification || {};
      if (Notification.permission === 'granted' && title) {
        new Notification(title, { body, icon: '/logo192.png' });
      }
    });
    return () => { if (typeof unsub === 'function') unsub(); };
  }, []);

  if (isSurvey) return <Survey />;

  const speakWelcome = async (residentName) => {
    try {
      if (!window.speechSynthesis) return;
      const res = await fetch('https://servfixy-production.up.railway.app/api/residents/welcome-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: residentName || '' })
      });
      const { message } = await res.json();
      if (!message) return;
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(message);
      utt.rate = 0.92;
      utt.pitch = 1.08;
      utt.volume = 1;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => /samantha|karen|moira|victoria|google us english/i.test(v.name));
      if (preferred) utt.voice = preferred;
      window.speechSynthesis.speak(utt);
    } catch (e) {
      console.warn('[speakWelcome]', e);
    }
  };

  const handleLogin = (token, residentData) => {
    localStorage.setItem('residentToken', token);
    localStorage.setItem('residentData', JSON.stringify(residentData));
    setToken(token);
    setResident(residentData);
    // Register FCM push token on login
    if (token) registerPushToken(token).catch(() => {});
    // Welcome message
    speakWelcome(residentData?.name || residentData?.full_name);
  };

  const handleLogout = () => {
    localStorage.removeItem('residentToken');
    localStorage.removeItem('residentData');
    setToken(null);
    setResident(null);
  };

  return (
    <div className="App">
      {!resident ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard resident={resident} token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;