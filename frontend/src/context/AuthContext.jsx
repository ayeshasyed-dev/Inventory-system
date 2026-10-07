import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('inventory_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('inventory_token');
      const storedUser = localStorage.getItem('inventory_user');

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error('Failed to parse cached user', e);
          }
        }

        // Verify token with backend
        try {
          const res = await authService.getMe();
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('inventory_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification failed, logging out');
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.data && res.data.token) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('inventory_token', res.data.token);
      localStorage.setItem('inventory_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const register = async (name, email, password, role = 'admin') => {
    const res = await authService.register({ name, email, password, role });
    if (res.data && res.data.token) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('inventory_token', res.data.token);
      localStorage.setItem('inventory_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = () => {
    try {
      authService.logout().catch(() => {});
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('inventory_token');
      localStorage.removeItem('inventory_user');
    }
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
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
