import React, { useState, useEffect } from 'react';
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
    }
  }, []);

  if (isSurvey) return <Survey />;

  const handleLogin = (token, residentData) => {
    localStorage.setItem('residentToken', token);
    localStorage.setItem('residentData', JSON.stringify(residentData));
    setToken(token);
    setResident(residentData);
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