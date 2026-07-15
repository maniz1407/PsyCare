import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('psycare_token');
    const storedUser = localStorage.getItem('psycare_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('psycare_token', accessToken);
    localStorage.setItem('psycare_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('psycare_token');
    localStorage.removeItem('psycare_user');
  };

  const isPsychologist = () => {
    return user && user.role === 'ROLE_PSYCHOLOGIST';
  };

  const isClient = () => {
    return user && user.role === 'ROLE_CLIENT';
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isPsychologist, isClient }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
