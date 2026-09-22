import ky, { HTTPError } from 'ky';
import { clearTokens, getAccessToken, getRefreshToken, setAccessToken } from './tokens';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export interface MeUser {
  id: number;
  username: string;
  email: string;
  display_name: string;
  avatar_url: string;
  role: string;
  date_joined: string;
  last_login: string | null;
  providers: OAuthProvider[];
}

export type OAuthProvider = 'discord' | 'google';

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
    setAccessToken(data.access);
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
