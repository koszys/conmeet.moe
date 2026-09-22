'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, type MeUser, type OAuthProvider } from '@/shared/lib/api';
import { clearTokens, getAccessToken } from '@/shared/lib/tokens';
import { oauthStartUrl } from './lib/oauth';

interface AuthContextValue {
  user: MeUser | null;
  loading: boolean;
  login: (provider: OAuthProvider) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      if (!getAccessToken()) {
        setUser(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const me = await api.get('api/v1/auth/me/').json<MeUser>();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadUser();

    function onAuthChange() {
      void loadUser();
    }

    window.addEventListener('conmeet-auth-change', onAuthChange);
    window.addEventListener('storage', onAuthChange);
    return () => {
      cancelled = true;
      window.removeEventListener('conmeet-auth-change', onAuthChange);
      window.removeEventListener('storage', onAuthChange);
    };
  }, []);

  const login = useCallback((provider: OAuthProvider) => {
    window.location.assign(oauthStartUrl(provider));
  }, []);

  const logout = useCallback(() => {
    void api.post('api/v1/auth/logout/').catch(() => undefined);
    clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
