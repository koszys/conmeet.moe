export const TOKEN_KEYS = {
  access: 'conmeet-access-token',
  refresh: 'conmeet-refresh-token',
} as const;

export const AUTH_EVENT = 'conmeet-auth-change';

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

export function setAccessToken(accessToken: string): void {
  window.localStorage.setItem(TOKEN_KEYS.access, accessToken);
  window.dispatchEvent(new Event(AUTH_EVENT));
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
