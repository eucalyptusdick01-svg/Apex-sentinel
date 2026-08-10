import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  isPro?: boolean;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  runCount: number;
  incrementRunCount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [runCount, setRunCount] = useState(0);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${BASE}/api/auth/me`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
      // Load run count from storage
      const stored = await AsyncStorage.getItem('guestRunCount');
      setRunCount(stored ? parseInt(stored, 10) : 0);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    setUser(data);
    // Reset guest run count after login
    await AsyncStorage.setItem('guestRunCount', '0');
    setRunCount(0);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    const data = await res.json();
    setUser(data);
    await AsyncStorage.setItem('guestRunCount', '0');
    setRunCount(0);
  }, []);

  const logout = useCallback(async () => {
    await fetch(`${BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
  }, []);

  const incrementRunCount = useCallback(async () => {
    const next = runCount + 1;
    setRunCount(next);
    await AsyncStorage.setItem('guestRunCount', String(next));
  }, [runCount]);

  React.useEffect(() => { checkAuth(); }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, checkAuth, runCount, incrementRunCount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
