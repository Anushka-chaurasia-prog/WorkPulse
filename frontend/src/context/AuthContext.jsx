import React, { createContext, useState, useEffect, useCallback } from 'react';
import authApi from '../api/authApi';
import {
  getToken,
  setToken,
  getUser,
  setUser,
  removeToken,
  parseJwt,
} from '../utils/tokenStorage';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(getToken());
  const [user, setUserState] = useState(getUser());
  const [loading, setLoading] = useState(true);

  // Restore authentication state on initial load
  useEffect(() => {
    const savedToken = getToken();
    const savedUser = getUser();
    if (savedToken) {
      const claims = parseJwt(savedToken);
      const userInfo = savedUser || {
        username: claims?.sub || 'User',
        role: claims?.roles?.[0] || 'ROLE_USER',
      };
      setTokenState(savedToken);
      setUserState(userInfo);
    } else {
      setTokenState(null);
      setUserState(null);
    }
    setLoading(false);
  }, []);

  // Listen to 401 unauthorized events from axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      setTokenState(null);
      setUserState(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials);
    const jwtToken = data.token;
    const claims = parseJwt(jwtToken);
    const userInfo = {
      username: claims?.sub || credentials.username.trim(),
      role: claims?.roles?.[0] || 'ROLE_USER',
    };

    setToken(jwtToken);
    setUser(userInfo);
    setTokenState(jwtToken);
    setUserState(userInfo);
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const data = await authApi.register(userData);
    return data;
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setTokenState(null);
    setUserState(null);
  }, []);

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token),
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
