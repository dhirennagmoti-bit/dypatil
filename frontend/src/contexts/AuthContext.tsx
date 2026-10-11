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

const DEMO_FALLBACK_USERS: Record<string, User> = {
  'sarah.policyholder@example.com': {
    id: 'aaaaaaaa-1111-0000-0000-000000000007',
    email: 'sarah.policyholder@example.com',
    fullName: 'Rahul Sharma',
    role: 'POLICYHOLDER',
    insurerId: null,
    insurerName: null,
    phone: '+91-9876543210',
    active: true,
  },
  'david.policyholder@example.com': {
    id: 'aaaaaaaa-1111-0000-0000-000000000008',
    email: 'david.policyholder@example.com',
    fullName: 'Priya Patel',
    role: 'POLICYHOLDER',
    insurerId: null,
    insurerName: null,
    phone: '+91-9876543211',
    active: true,
  },
  'officer.apex@example.com': {
    id: 'aaaaaaaa-1111-0000-0000-000000000003',
    email: 'officer.apex@example.com',
    fullName: 'Rajesh Verma',
    role: 'CLAIMS_OFFICER',
    insurerId: '11111111-1111-0000-0000-000000000001',
    insurerName: 'Apex Mutual Insurance',
    phone: '+91-9876543212',
    active: true,
  },
  'supervisor.apex@example.com': {
    id: 'aaaaaaaa-1111-0000-0000-000000000004',
    email: 'supervisor.apex@example.com',
    fullName: 'Vikram Malhotra',
    role: 'SUPERVISOR',
    insurerId: '11111111-1111-0000-0000-000000000001',
    insurerName: 'Apex Mutual Insurance',
    phone: '+91-9876543213',
    active: true,
  },
  'admin.apex@example.com': {
    id: 'aaaaaaaa-1111-0000-0000-000000000002',
    email: 'admin.apex@example.com',
    fullName: 'Marcus Thorne',
    role: 'INSURER_ADMIN',
    insurerId: '11111111-1111-0000-0000-000000000001',
    insurerName: 'Apex Mutual Insurance',
    phone: '+91-9876543214',
    active: true,
  },
  'compliance.auditor@example.com': {
    id: 'aaaaaaaa-1111-0000-0000-000000000005',
    email: 'compliance.auditor@example.com',
    fullName: 'Ananya Sen',
    role: 'AUDITOR',
    insurerId: null,
    insurerName: null,
    phone: '+91-9876543215',
    active: true,
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('insurechain_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        if (token.startsWith('demo-session-token-')) {
          try {
            const raw = atob(token.replace('demo-session-token-', ''));
            setUser(JSON.parse(raw));
          } catch (_) {
            setUser(null);
          }
          setIsLoading(false);
          return;
        }
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
    } catch (err: any) {
      const fallback = DEMO_FALLBACK_USERS[email.trim().toLowerCase()];
      if (fallback && (err.message?.includes('405') || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError'))) {
        console.warn('Backend unavailable; activating offline demo session for', email);
        const demoToken = 'demo-session-token-' + btoa(JSON.stringify(fallback));
        setAuthToken(demoToken);
        setToken(demoToken);
        setUser(fallback);
        return;
      }
      throw err;
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
