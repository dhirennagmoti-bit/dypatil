import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, setAuthToken } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (data: { email: string; password: string; fullName: string; role?: string; insurerId?: string }) => Promise<void>;
  logout: () => void;
  quickSwitch: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('insurechain_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const profile = await api.auth.me();
          setUser(profile);
        } catch (e) {
          console.error('Session expired or invalid token', e);
          setAuthToken(null);
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email: string, password = 'Password123!') => {
    setIsLoading(true);
    try {
      const resp = await api.auth.login({ email, password });
      setAuthToken(resp.token);
      setToken(resp.token);
      setUser(resp.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; fullName: string; role?: string; insurerId?: string }) => {
    setIsLoading(true);
    try {
      const resp = await api.auth.register(data);
      setAuthToken(resp.token);
      setToken(resp.token);
      setUser(resp.user);
    } finally {
      setIsLoading(false);
    }
  };

  const quickSwitch = async (email: string) => {
    await login(email, 'Password123!');
  };

  const logout = () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const profile = await api.auth.me();
      setUser(profile);
    } catch (_) {}
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, quickSwitch, refreshUser }}>
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
