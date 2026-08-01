import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await api.get('/auth/me');
        setUser(res.data.data);
      } catch (err) {
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password, role = 'student') => {
    const endpoint = role === 'admin' ? '/auth/login' : '/auth/login';
    const res = await api.post(endpoint, { email, password });
    localStorage.setItem('token', res.data.data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.data.token}`;
    setUser(res.data.data.user);
    try {
      const me = await api.get('/auth/me');
      setUser(me.data.data);
    } catch { /* keep login response user */ }
    return res.data;
  };

  const adminLogin = async (username, password) => {
    const res = await api.post('/auth/admin-login', { username, password });
    localStorage.setItem('token', res.data.data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.data.token}`;
    setUser(res.data.data.user);
    try {
      const me = await api.get('/auth/me');
      setUser(me.data.data);
    } catch { /* keep login response user */ }
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, adminLogin, register, logout, loadUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
