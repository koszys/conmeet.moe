'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, Moon, Sparkles, Sun, X } from 'lucide-react';
import { useTheme } from '@/app/providers/theme-provider';
import { SocialButton } from '@/shared/components/SocialButton';
import { MikuSilhouette } from '@/shared/components/MikuSilhouette';
import { cn } from '@/shared/lib/utils';

const NAV_LINKS = [
  { name: 'How it works', href: '#features' },
  { name: 'Line-up', href: '#conventions' },
];

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-ink sticky top-0 z-50 border-b-2 bg-white/90 backdrop-blur dark:bg-[#373b3e]/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-7">
          <Link
            href="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group flex items-center gap-3"
          >
            <span className="font-display text-base tracking-wide [text-shadow:2px_2px_0_color-mix(in_srgb,var(--ink)_22%,transparent)] sm:text-2xl">
              conmeet<span className="text-accent">.moe</span>
            </span>
            <span className="border-ink bg-accent flex h-9 w-9 -rotate-6 items-center justify-center overflow-hidden rounded-sm border-2 shadow-[2px_2px_0_var(--ink)] transition-transform group-hover:-rotate-12">
              <MikuSilhouette className="h-6 w-auto -rotate-12 text-white" />
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
          <SocialButton platform="discord" disabled className="hidden sm:inline-flex" />
          <SocialButton platform="kofi" className="hidden sm:inline-flex" />
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="border-ink hover:border-accent-pop hover:text-accent-pop inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-none border-2 text-zinc-700 shadow-[2px_2px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none dark:text-zinc-200"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="border-ink hover:border-accent-pop hover:text-accent-pop inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-none border-2 text-zinc-700 shadow-[2px_2px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none md:hidden dark:text-zinc-200"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <nav
        aria-hidden={!menuOpen}
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-in-out md:hidden',
          menuOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={cn(
              'border-ink border-t-2 bg-white transition-opacity duration-300 dark:bg-[#373b3e]',
              menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
            )}
          >
            <div className="mx-auto flex max-w-6xl flex-col px-4 py-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="border-ink hover:text-accent-pop border-b-2 border-dashed py-4 text-sm font-bold tracking-widest text-zinc-600 uppercase transition-colors last:border-b-0 dark:text-zinc-300"
                >
                  {link.name}
                </a>
              ))}
              <div className="mt-4 flex gap-2 sm:hidden">
                <SocialButton platform="discord" disabled />
                <SocialButton platform="kofi" />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
