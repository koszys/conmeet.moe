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
import { clearGuestSaves, getGuestSaves } from '@/shared/lib/guestSaves';
import { clearTokens, getAccessToken } from '@/shared/lib/tokens';
import { oauthStartUrl } from './lib/oauth';

interface AuthContextValue {
  user: MeUser | null;
  loading: boolean;
  login: (provider: OAuthProvider, next?: string | null) => void;
  logout: () => void;
  updateUser: (user: MeUser) => void;
  refreshUser: () => Promise<void>;
  usernameCollisionNotice: boolean;
  dismissUsernameCollisionNotice: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [usernameCollisionNotice, setUsernameCollisionNotice] = useState(false);
  const prevUserRef = useRef<MeUser | null>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('username_collision_notice') === 'true') {
        setUsernameCollisionNotice(true);
      }
    } catch {
      // Ignore
    }
  }, []);

  const dismissUsernameCollisionNotice = useCallback(() => {
    try {
      sessionStorage.removeItem('username_collision_notice');
    } catch {
      // Ignore
    }
    setUsernameCollisionNotice(false);
  }, []);

  const updateUser = useCallback((updated: MeUser) => {
    prevUserRef.current = updated;
    setUser(updated);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!getAccessToken()) return;
    try {
      const me = await api.get('api/v1/auth/me/').json<MeUser>();
      prevUserRef.current = me;
      setUser(me);
    } catch {
      // Ignore
    }
  }, []);

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

          // Auto-sync guest saves if present upon login
          const guest = getGuestSaves();
          if (
            guest.meetups.length > 0 ||
            guest.freebies.length > 0 ||
            guest.albums.length > 0 ||
            guest.claimed_freebies.length > 0
          ) {
            try {
              await api.post('api/v1/auth/sync-saves/', {
                json: {
                  meetup_ids: guest.meetups,
                  freebie_ids: guest.freebies,
                  claimed_freebie_ids: guest.claimed_freebies,
                  album_ids: guest.albums,
                },
              });
              clearGuestSaves();
              queryClient.invalidateQueries();
            } catch (syncErr) {
              console.error('Failed to sync guest saves:', syncErr);
            }
          }
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
    clearGuestSaves();
    try {
      sessionStorage.removeItem('username_collision_notice');
    } catch {
      // Ignore
    }
    setUsernameCollisionNotice(false);
    prevUserRef.current = null;
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
        refreshUser,
        usernameCollisionNotice,
        dismissUsernameCollisionNotice,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
