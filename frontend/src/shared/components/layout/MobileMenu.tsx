'use client';

import type { RefObject } from 'react';
import Link from 'next/link';
import { Moon, Search, Sun } from 'lucide-react';
import { useTheme } from '@/app/_providers/theme-provider';
import { SocialButton } from '@/shared/components/SocialButton';
import { IconButton } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { AccountButton } from './AccountButton';

export function MobileMenu({
  open,
  isConventionPage,
  hideNav,
  onClose,
  onAccountToggle,
  dropdownUserWrap,
}: {
  open: boolean;
  isConventionPage: boolean;
  hideNav: boolean;
  onClose: () => void;
  onAccountToggle: () => void;
  dropdownUserWrap: RefObject<HTMLDivElement | null>;
}) {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav
      aria-hidden={!open}
      className={cn(
        'grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out md:hidden',
        open && 'grid-rows-[1fr]'
      )}
    >
      <div className={cn('min-h-0', open ? 'overflow-visible' : 'overflow-hidden')}>
        <div
          className={cn(
            'border-ink border-t-2 bg-white transition-opacity duration-300 dark:bg-[#373b3e]',
            open ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
        >
          <div className="mx-auto flex max-w-6xl flex-col px-4 py-4">
            {hideNav && (
              <Link
                href="/"
                onClick={onClose}
                className="border-ink hover:text-accent-pop border-b-2 border-dashed py-4 text-sm font-bold tracking-widest text-zinc-600 uppercase transition-colors last:border-b-0 dark:text-zinc-300"
              >
                Home
              </Link>
            )}
            <Link
              href="/conventions"
              onClick={onClose}
              className="border-ink hover:text-accent-pop border-b-2 border-dashed py-4 text-sm font-bold tracking-widest text-zinc-600 uppercase transition-colors last:border-b-0 dark:text-zinc-300"
            >
              Conventions
            </Link>
            <div className="mt-4 flex justify-end gap-2 sm:hidden">
              {!isConventionPage && (
                <IconButton
                  onClick={() => {
                    onClose();
                    window.setTimeout(
                      () => window.dispatchEvent(new CustomEvent('conmeet:open-search')),
                      300
                    );
                  }}
                  aria-label="Search conventions"
                  className="hidden max-[550px]:inline-flex"
                >
                  <Search className="h-4 w-4" />
                </IconButton>
              )}
              <IconButton
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="hidden max-[500px]:inline-flex"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </IconButton>
              <SocialButton platform="kofi" className="hidden max-[450px]:inline-flex" />
              <div ref={dropdownUserWrap} className="hidden max-[400px]:block">
                <AccountButton onToggle={onAccountToggle} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
