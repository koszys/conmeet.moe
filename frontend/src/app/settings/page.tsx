'use client';

import { useAuth } from '@/features/auth/auth-provider';
import { RequireAuth } from '@/features/auth/require-auth';
import { SpinBackdrop } from '@/shared/components/SpinBackdrop';
import { Footer } from '@/shared/components/layout/Footer';
import { Header } from '@/shared/components/layout/Header';

const PROVIDER_NAMES: Record<string, string> = {
  discord: 'Discord',
  google: 'Google',
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
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              No social accounts linked.
            </span>
          )}
          {providers.map((provider) => (
            <span
              key={provider}
              className="rounded-none border-2 px-3 py-1 text-sm font-bold tracking-wide uppercase"
            >
              {PROVIDER_NAMES[provider] ?? provider}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm text-zinc-400 dark:text-zinc-400">
          Same-email logins are linked to this account automatically.
        </p>
      </section>
      <div className="border-ink mt-8 rounded-none border-2 border-dashed bg-white/70 p-8 text-sm text-zinc-400 backdrop-blur-sm dark:bg-[#373b3e]/70 dark:text-zinc-400">
        Convention schedules, freebies, and meetups land here in Phase 2.
      </div>
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
