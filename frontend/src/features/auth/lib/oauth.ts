import { API_BASE } from '@/shared/lib/api';

import type { OAuthProvider } from '@/shared/lib/api';

export function oauthStartUrl(provider: OAuthProvider): string {
  return `${API_BASE}/accounts/${provider}/login/`;
}
