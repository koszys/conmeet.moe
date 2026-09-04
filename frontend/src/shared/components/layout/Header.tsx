'use client';

import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/app/providers/theme-provider';

const NAV_LINKS = [
  { name: 'How it works', href: '#features' },
  { name: 'Line-up', href: '#conventions' },
];

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-ink sticky top-0 z-50 border-b-2 bg-white/90 backdrop-blur dark:bg-[#0c0c0e]/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-baseline gap-2"
        >
          <span className="font-display text-2xl tracking-wide">
            conmeet<span className="text-accent">.moe</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-xs font-bold tracking-widest text-zinc-600 uppercase md:flex dark:text-zinc-300">
          {NAV_LINKS.map((link) => (
            <a key={link.name} href={link.href} className="hover:text-accent-pop transition-colors">
              {link.name}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="border-ink hover:border-accent-pop hover:text-accent-pop inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border-2 text-zinc-700 shadow-[2px_2px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none dark:text-zinc-200"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
