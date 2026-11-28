'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useAuth } from '@/features/auth';
import { BrandMark } from '@/shared/components/brand/BrandMark';
import { DiscordLogo, GoogleLogo } from '@/shared/components/brand/OAuthProviders';
import { SpinBackdrop } from '@/shared/components/miku';
import { BackLink, StatusBanner } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';

function ProviderButton({
  label,
  backgroundColor,
  onClick,
  className,
  children,
}: {
  label: string;
  backgroundColor: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'border-ink flex w-full cursor-pointer items-center justify-center gap-3 border-2 px-6 py-3 text-sm font-bold tracking-wider text-white uppercase shadow-[3px_3px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none',
        className
      )}
      style={{ backgroundColor }}
    >
      {children}
      {label}
    </button>
  );
}

function LoginContent() {
  const { user, login } = useAuth();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const rawRedirect = searchParams.get('redirect') || searchParams.get('next');
  const hasReturnTarget = Boolean(
    rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
  );
  const safeReturnUrl = hasReturnTarget ? rawRedirect! : '/';
  const returnLabel = hasReturnTarget ? 'Go back' : 'Back to home';

  const handleProviderLogin = (provider: 'discord' | 'google') => {
    if (hasReturnTarget) {
      try {
        localStorage.setItem('auth_redirect', safeReturnUrl);
        sessionStorage.setItem('auth_redirect', safeReturnUrl);
        document.cookie = `auth_redirect=${encodeURIComponent(safeReturnUrl)}; path=/; max-age=600; SameSite=Lax`;
      } catch {
        // Ignore storage errors
      }
    }
    login(provider, hasReturnTarget ? safeReturnUrl : null);
  };

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-12">
      <SpinBackdrop />
      <div className="border-ink relative z-10 w-full max-w-sm rounded-none border-2 bg-white p-8 shadow-[6px_6px_0_var(--ink)] dark:bg-[#373b3e]">
        <div className="mb-6 flex flex-col items-center gap-2">
          <BrandMark size="lg" />
          <h1 className="font-display text-xl tracking-wide [text-shadow:2px_2px_0_color-mix(in_srgb,var(--ink)_22%,transparent)]">
            conmeet<span className="text-accent">.moe</span>
          </h1>
          <p className="text-center text-xs font-bold tracking-widest text-zinc-400 uppercase">
            Sign in to save meetups, check off freebies, and join the timeline
          </p>
        </div>

        {user ? (
          <div className="space-y-3">
            <p className="text-center text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              You&apos;re signed in as {user.display_name || user.username}.
            </p>
            <Link
              href="/settings"
              className="border-ink bg-accent hover:bg-accent-pop flex w-full items-center justify-center border-2 px-6 py-3 text-sm font-bold tracking-wider text-white uppercase shadow-[3px_3px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none dark:text-zinc-950 dark:hover:text-white"
            >
              Go to Settings
            </Link>
            <div className="pt-1 text-center">
              <BackLink href={safeReturnUrl}>{returnLabel}</BackLink>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <StatusBanner
              variant="error"
              message={
                error
                  ? error === 'cancelled'
                    ? 'Sign-in was cancelled. You can try again below.'
                    : 'Sign-in failed. Please try again.'
                  : null
              }
              className="mt-0"
            />
            <ProviderButton
              label="Discord"
              backgroundColor="#5865F2"
              onClick={() => handleProviderLogin('discord')}
            >
              <span className="flex h-5 w-5 items-center justify-center">
                <DiscordLogo size={20} />
              </span>
            </ProviderButton>
            <ProviderButton
              label="Google"
              backgroundColor="#ffffff"
              className="!text-ink"
              onClick={() => handleProviderLogin('google')}
            >
              <GoogleLogo />
            </ProviderButton>

            <div className="pt-2 text-center">
              <BackLink href={safeReturnUrl}>{returnLabel}</BackLink>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center">
          <span className="text-sm font-bold tracking-widest text-zinc-500 uppercase">
            Loading…
          </span>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
