'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import api from '@/lib/api';
import Cookies from 'js-cookie';

interface User {
  id: string; name: string; email: string; role: string;
  is_verified: boolean; plan_name?: string; plan_slug?: string;
  avatar_url?: string; subscription_status?: string;
  max_bots?: number; max_messages_per_month?: number;
  messages_used_this_month?: number;
  allow_url_scraping?: boolean; allow_db_connect?: boolean;
  allow_analytics?: boolean; allow_branding_removal?: boolean;
  allow_api_access?:boolean
}

interface AuthContextType {
  user: User | null; token: string | null;
  loading: boolean; wasDowngraded: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void; refreshUser: () => Promise<void>;
  clearDowngraded: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [wasDowngraded, setWasDowngraded] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      if (data.wasDowngraded) setWasDowngraded(true);
    } catch {
      // logout();
    }
  }, []);

  useEffect(() => {
    const t = Cookies.get('intra_token') || localStorage.getItem('intra_token');
    if (t) {
      setToken(t);
      api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { token: t, user: u } = data;
    setToken(t);
    Cookies.set('intra_token', t, { expires: 7, sameSite: 'lax' });
    localStorage.setItem('intra_token', t);
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    // Always fetch full user with plan permissions from /auth/me
    // The login response may not contain all plan flags
    try {
      const me = await api.get('/auth/me');
      setUser(me.data.user);
    } catch {
      setUser(u); // fallback to login response
    }
  };

  const logout = () => {
    setUser(null); setToken(null);
    Cookies.remove('intra_token');
    localStorage.removeItem('intra_token');
    delete api.defaults.headers.common['Authorization'];
    window.location.href = '/auth/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, wasDowngraded, login, logout, refreshUser, clearDowngraded: () => setWasDowngraded(false) }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
