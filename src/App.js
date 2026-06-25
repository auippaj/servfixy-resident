import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Survey from './components/Survey';
import './App.css';

function App() {
  const [resident, setResident] = useState(null);
  const [token, setToken] = useState(null);

  // Serve survey page without requiring login
  if (window.location.pathname === '/survey') {
    return <Survey />;
  }

  useEffect(() => {
    const savedToken = localStorage.getItem('residentToken');
    const savedResident = localStorage.getItem('residentData');
    if (savedToken && savedResident) {
      setToken(savedToken);
      setResident(JSON.parse(savedResident));
    }
  }, []);

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