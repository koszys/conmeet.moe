'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setTokens } from '@/shared/lib/tokens';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
      router.replace('/login?error=missing_token');
      return;
    }

    setTokens(accessToken, refreshToken);

    const nextFromQuery = new URLSearchParams(window.location.search).get('next');

    let storedRedirect: string | null = null;
    try {
      storedRedirect =
        sessionStorage.getItem('auth_redirect') || localStorage.getItem('auth_redirect');
      sessionStorage.removeItem('auth_redirect');
      localStorage.removeItem('auth_redirect');
    } catch {
      // Ignore storage errors
    }

    if (!storedRedirect) {
      const match = document.cookie.match(/(?:^|;\s*)auth_redirect=([^;]+)/);
      if (match) {
        storedRedirect = decodeURIComponent(match[1]);
        document.cookie = 'auth_redirect=; path=/; max-age=0; SameSite=Lax';
      }
    }

    const nextCandidate = nextFromQuery || storedRedirect;
    const safeTarget =
      nextCandidate && nextCandidate.startsWith('/') && !nextCandidate.startsWith('//')
        ? nextCandidate
        : '/settings';

    router.replace(safeTarget);
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="text-sm font-bold tracking-widest text-zinc-500 uppercase">
        Signing you in…
      </span>
    </div>
  );
}
