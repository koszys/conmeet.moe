'use client';

import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/app/providers/theme-provider';

const NAV_LINKS = [
  { name: 'Conventions', href: '#conventions' },
  { name: 'Freebies', href: '#freebies' },
  { name: 'Meetups', href: '#meetups' },
  { name: 'Schedules', href: '#schedules' },
];

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/70 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          conmeet<span className="text-accent">.moe</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-600 md:flex dark:text-zinc-400">
          {NAV_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="hover:text-accent dark:hover:text-accent transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="hover:border-accent dark:hover:border-accent inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition-colors dark:border-zinc-700 dark:text-zinc-300"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
