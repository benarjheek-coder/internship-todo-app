import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Keep a ref so the interceptor can always access the latest logout function
  const logoutRef = useRef(null);

  // ── Bootstrap: load stored user ──────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('benny_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); }
      catch { localStorage.removeItem('benny_user'); }
    }
    setLoading(false);
  }, []);

  // ── Global 401 interceptor ────────────────────────────────────────────────
  // Fires whenever ANY axios request returns 401 (token invalid / user deleted)
  // Automatically clears localStorage and redirects to login.
  useEffect(() => {
    const id = axios.interceptors.response.use(
      res => res,
      err => {
        const status = err?.response?.status;
        const msg = err?.response?.data?.message || '';
        if (
          status === 401 &&
          (msg.includes('no longer exists') || msg.includes('Not authorized') || msg.includes('invalid token'))
        ) {
          // Clear stale auth and redirect cleanly
          localStorage.removeItem('benny_user');
          setUser(null);
          // Use replace so pressing Back doesn't re-trigger the error
          window.location.replace('/login');
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(id);
  }, []);

  // ── Auth helpers ──────────────────────────────────────────────────────────
  const updateUserLocally = (updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('benny_user', JSON.stringify(updated));
      return updated;
    });
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem('benny_user', JSON.stringify(res.data));
      setUser(res.data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post(`${API}/auth/register`, { name, email, password });
      localStorage.setItem('benny_user', JSON.stringify(res.data));
      setUser(res.data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('benny_user');
    setUser(null);
  };

  const refreshUser = async () => {
    if (!user?.token) return;
    try {
      const res = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      updateUserLocally(res.data);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserLocally, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
