import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('insurance_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('insurance_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('insurance_user');
    }
  }, [user]);

  const login = async (credentials) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await api.login(credentials);
      if (res.success && res.data) {
        setUser(res.data);
        return res.data;
      }
      throw new Error(res.error || 'Login failed');
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await api.signup(userData);
      if (res.success && res.data) {
        setUser(res.data);
        return res.data;
      }
      throw new Error(res.error || 'Sign-up failed');
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('insurance_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, authError, setAuthError, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

