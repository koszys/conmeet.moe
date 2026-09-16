'use client';

import Image from 'next/image';
import { useAuth } from '@/features/auth/auth-provider';
import { RequireAuth } from '@/features/auth/require-auth';
import { SpinBackdrop } from '@/shared/components/miku/SpinBackdrop';
import { Footer } from '@/shared/components/layout/Footer';
import { Header } from '@/shared/components/layout/Header';
import discordLogo from '@/assets/social/discordlogo.png';
import { cn } from '@/shared/lib/utils';

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

const PROVIDERS: Record<
  string,
  { label: string; backgroundColor: string; textClassName: string; icon: React.ReactNode }
> = {
  discord: {
    label: 'Discord',
    backgroundColor: '#5865F2',
    textClassName: '!text-white',
    icon: (
      <Image
        src={discordLogo}
        alt=""
        width={16}
        height={16}
        className="brightness-0 invert"
      />
    ),
  },
  google: {
    label: 'Google',
    backgroundColor: '#ffffff',
    textClassName: '!text-ink',
    icon: <GoogleLogo className="h-4 w-4" />,
  },
};

function AccountSettingsContent() {
  const { user } = useAuth();

  const providers = user?.providers ?? [];

  return (
    <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center overflow-hidden px-4 py-12 md:px-6">
      <SpinBackdrop />
      <div className="relative">
        <h1 className="font-display text-3xl tracking-wide [text-shadow:2px_2px_0_color-mix(in_srgb,var(--ink)_22%,transparent)] md:text-4xl">
          Account Settings
        </h1>
        <p className="mt-2 font-bold tracking-widest text-zinc-400 uppercase">
          Welcome back{user ? `, ${user.display_name || user.username}` : ''}
        </p>
      </div>
      <section className="border-ink mt-8 rounded-none border-2 border-dashed bg-white/70 p-8 backdrop-blur-sm dark:bg-[#373b3e]/70">
        <h2 className="text-sm font-bold tracking-widest text-zinc-400 uppercase">
          Connected accounts
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {providers.length === 0 && (
            <span className="text-sm text-zinc-500 dark:text-zinc-300">
              No social accounts linked.
            </span>
          )}
          {providers.map((provider) => {
            const config = PROVIDERS[provider];
            if (!config) {
              return (
                <span
                  key={provider}
                  className="rounded-none border-2 px-3 py-1 text-sm font-bold tracking-wide uppercase"
                >
                  {provider}
                </span>
              );
            }
            return (
              <span
                key={provider}
                className={cn(
                  'flex items-center gap-2 rounded-none border-2 px-3 py-1 text-sm font-bold tracking-wide uppercase shadow-[2px_2px_0_var(--ink)]',
                  config.textClassName
                )}
                style={{ backgroundColor: config.backgroundColor }}
              >
                {config.icon}
                {config.label}
              </span>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-zinc-400 dark:text-zinc-300">
          Same-email logins are linked to this account automatically.
        </p>
      </section>
    </main>
  );
}

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <RequireAuth>
        <AccountSettingsContent />
      </RequireAuth>
      <Footer />
    </div>
  );
}
