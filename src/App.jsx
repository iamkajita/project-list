import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Main from './components/Main';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (token) => {
    setIsAuthenticated(true);
  };

  return isAuthenticated ? <Main /> : <Login onLogin={handleLogin} />;
}

export default App;
