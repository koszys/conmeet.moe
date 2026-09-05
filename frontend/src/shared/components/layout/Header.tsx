'use client';

import Link from 'next/link';
import { Moon, Sparkles, Star, Sun } from 'lucide-react';
import { useTheme } from '@/app/providers/theme-provider';
import { SocialButton } from '@/shared/components/SocialButton';

const NAV_LINKS = [
  { name: 'How it works', href: '#features' },
  { name: 'Line-up', href: '#conventions' },
];

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-ink sticky top-0 z-50 border-b-2 bg-white/90 backdrop-blur dark:bg-[#0c0c0e]/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-7">
          <Link
            href="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group flex items-center gap-3"
          >
            <span className="font-display text-lg tracking-wide [text-shadow:2px_2px_0_color-mix(in_srgb,var(--ink)_22%,transparent)] sm:text-2xl">
              conmeet<span className="text-accent">.moe</span>
            </span>
            <span className="border-ink bg-accent-pop flex h-9 w-9 -rotate-6 items-center justify-center rounded-sm border-2 shadow-[2px_2px_0_var(--ink)] transition-transform group-hover:-rotate-12">
              <Star className="h-4 w-4 rotate-12 fill-white text-white" />
            </span>
            <Sparkles className="text-accent h-3.5 w-3.5 rotate-12 transition-transform group-hover:rotate-45" />
          </Link>

          <nav className="hidden items-center gap-7 text-xs font-bold tracking-widest text-zinc-600 uppercase md:flex dark:text-zinc-300">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="hover:text-accent-pop transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* can disable these buttons by adding disabled at the end */}
          <SocialButton platform="discord" disabled />
          <SocialButton platform="kofi" />
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="border-ink hover:border-accent-pop hover:text-accent-pop inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-none border-2 text-zinc-700 shadow-[2px_2px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none dark:text-zinc-200"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
