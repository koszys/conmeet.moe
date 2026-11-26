'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, type MeUser, type OAuthProvider } from '@/shared/lib/api';
import { clearTokens, getAccessToken } from '@/shared/lib/tokens';
import { oauthStartUrl } from './lib/oauth';

interface AuthContextValue {
  user: MeUser | null;
  loading: boolean;
  login: (provider: OAuthProvider, next?: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const prevUserRef = useRef<MeUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      if (!getAccessToken()) {
        if (prevUserRef.current) {
          queryClient.clear();
        }
        prevUserRef.current = null;
        setUser(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const me = await api.get('api/v1/auth/me/').json<MeUser>();
        if (!cancelled) {
          prevUserRef.current = me;
          setUser(me);
        }
      } catch {
        if (!cancelled) {
          if (prevUserRef.current) {
            queryClient.clear();
          }
          prevUserRef.current = null;
          setUser(null);
        }
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
  }, [queryClient]);

  const login = useCallback((provider: OAuthProvider, next?: string | null) => {
    window.location.assign(oauthStartUrl(provider, next));
  }, []);

  const logout = useCallback(() => {
    void api.post('api/v1/auth/logout/').catch(() => undefined);
    clearTokens();
    prevUserRef.current = null;
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
