'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
import { MikuSilhouette } from '@/shared/components/MikuSilhouette';
import { cn } from '@/shared/lib/utils';
import discordLogo from '@/assets/social/discordlogo.png';

function GoogleLogo({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.6 39.6 16.3 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.7l6.2 5.2C36.9 39.3 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"
      />
    </svg>
  );
}

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

  return (
    <main className="bg-ink flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="border-ink w-full max-w-sm rounded-none border-2 bg-white p-8 shadow-[6px_6px_0_var(--ink)] dark:bg-[#373b3e]">
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="border-ink bg-accent flex h-12 w-12 -rotate-6 items-center justify-center overflow-hidden rounded-sm border-2 shadow-[2px_2px_0_var(--ink)]">
            <MikuSilhouette className="h-8 w-auto -rotate-12 text-white" />
          </span>
          <h1 className="font-display text-xl tracking-wide [text-shadow:2px_2px_0_color-mix(in_srgb,var(--ink)_22%,transparent)]">
            conmeet<span className="text-accent">.moe</span>
          </h1>
          <p className="text-center text-xs font-bold tracking-widest text-zinc-500 uppercase">
            Sign in to save meetups, check off freebies, and join the timeline
          </p>
        </div>

        {user ? (
          <div className="space-y-3">
            <p className="text-center text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              You&apos;re signed in as {user.display_name || user.username}.
            </p>
            <Link
              href="/dashboard"
              className="border-ink bg-accent hover:border-accent-pop flex w-full items-center justify-center border-2 px-6 py-3 text-sm font-bold tracking-wider text-white uppercase shadow-[3px_3px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/"
              className="hover:text-accent-pop block text-center text-xs font-bold tracking-widest text-zinc-500 uppercase"
            >
              Back to home
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {error && (
              <p className="border-accent bg-accent/10 text-accent-pop rounded-none border-2 px-3 py-2 text-xs font-bold tracking-wide uppercase">
                Sign-in failed. Please try again.
              </p>
            )}
            <ProviderButton
              label="Discord"
              backgroundColor="#5865F2"
              onClick={() => login('discord')}
            >
              <span className="flex h-5 w-5 items-center justify-center">
                <Image
                  src={discordLogo}
                  alt=""
                  width={20}
                  height={20}
                  className="brightness-0 invert"
                />
              </span>
            </ProviderButton>
            <ProviderButton
              label="Google"
              backgroundColor="#ffffff"
              className="!text-ink"
              onClick={() => login('google')}
            >
              <GoogleLogo />
            </ProviderButton>
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
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
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
