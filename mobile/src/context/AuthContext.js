import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { adminLogin as loginApi, getAdminMe } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('admin_token');
      if (storedToken) {
        setToken(storedToken);
        const res = await getAdminMe();
        if (res.success) {
          setAdmin(res.admin);
        } else {
          await logout();
        }
      }
    } catch (err) {
      console.log('Session check error or expired:', err?.message);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const res = await loginApi(username, password);
    if (res.success && res.token) {
      await AsyncStorage.setItem('admin_token', res.token);
      setToken(res.token);
      setAdmin(res.admin);
    }
    return res;
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('admin_token');
    } catch (e) {
      console.error('Error removing token:', e);
    }
    setToken('');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, token, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
