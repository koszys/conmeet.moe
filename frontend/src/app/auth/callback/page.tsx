'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setTokens } from '@/shared/lib/api';

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
    const next = new URLSearchParams(window.location.search).get('next');
    router.replace(next && next.startsWith('/') ? next : '/dashboard');
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="text-sm font-bold tracking-widest text-zinc-500 uppercase">
        Signing you in…
      </span>
    </div>
  );
}
