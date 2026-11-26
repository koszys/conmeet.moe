import { API_BASE } from '@/shared/lib/api';

import type { OAuthProvider } from '@/shared/lib/api';

export function oauthStartUrl(provider: OAuthProvider, next?: string | null): string {
  const base = `${API_BASE}/accounts/${provider}/login/`;
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    return `${base}?${new URLSearchParams({ next }).toString()}`;
  }
  return base;
}
