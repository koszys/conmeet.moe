import ky, { HTTPError } from 'ky';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export const TOKEN_KEYS = {
  access: 'conmeet-access-token',
  refresh: 'conmeet-refresh-token',
} as const;

const AUTH_EVENT = 'conmeet-auth-change';

export interface MeUser {
  id: number;
  username: string;
  email: string;
  display_name: string;
  avatar_url: string;
  role: string;
  date_joined: string;
  last_login: string | null;
}

export type OAuthProvider = 'discord' | 'google';

function readToken(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(key);
}

export function getAccessToken(): string | null {
  return readToken(TOKEN_KEYS.access);
}

export function getRefreshToken(): string | null {
  return readToken(TOKEN_KEYS.refresh);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  window.localStorage.setItem(TOKEN_KEYS.access, accessToken);
  window.localStorage.setItem(TOKEN_KEYS.refresh, refreshToken);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearTokens(): void {
  window.localStorage.removeItem(TOKEN_KEYS.access);
  window.localStorage.removeItem(TOKEN_KEYS.refresh);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function oauthStartUrl(provider: OAuthProvider): string {
  return `${API_BASE}/accounts/${provider}/login/`;
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const data = await ky
      .post(`${API_BASE}/api/v1/auth/refresh/`, {
        json: { refresh: refreshToken },
        timeout: 15000,
      })
      .json<{ access: string }>();
    window.localStorage.setItem(TOKEN_KEYS.access, data.access);
    window.dispatchEvent(new Event(AUTH_EVENT));
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

export const api = ky.create({
  prefixUrl: API_BASE,
  timeout: 15000,
  retry: { limit: 2, methods: ['get', 'put', 'patch', 'delete'] },
  hooks: {
    beforeRequest: [
      (request) => {
        const token = getAccessToken();
        if (token) request.headers.set('Authorization', `Bearer ${token}`);
      },
    ],
    beforeRetry: [
      async ({ request, error }) => {
        if (!(error instanceof HTTPError) || error.response.status !== 401) return;
        const refreshed = await refreshAccessToken();
        const token = getAccessToken();
        if (refreshed && token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
  },
});

export const apiTags = {
  user: ['user'],
  conventions: ['conventions'],
  convention: (slug: string) => ['conventions', slug],
  freebies: (conventionId: string) => ['freebies', conventionId],
  meetups: (conventionId: string) => ['meetups', conventionId],
} as const;
