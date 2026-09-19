'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, PanelLeft, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuth } from '@/features/auth/auth-provider';
import {
  isConventionDetailPath,
  useConventionNav,
} from '@/features/conventions/components/ConventionNavProvider';
import { BrandMark } from '@/shared/components/brand/BrandMark';
import { IconButton } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { HeaderActions } from './header-actions';
import { MobileMenu } from './mobile-menu';

const SCROLL_TO_TOP = () => window.scrollTo({ top: 0, behavior: 'smooth' });

export function Header() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const headerUserWrap = useRef<HTMLDivElement | null>(null);
  const dropdownUserWrap = useRef<HTMLDivElement | null>(null);
  const accountPopupWrap = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const nav = useConventionNav();
  const isConventionPage = isConventionDetailPath(pathname);
  const hideNav = pathname === '/login' || pathname === '/settings';

  useEffect(() => {
    if (!accountOpen) return;
    function onPointerDown(event: PointerEvent) {
      const wraps = [
        headerUserWrap.current,
        dropdownUserWrap.current,
        accountPopupWrap.current,
      ].filter(Boolean) as HTMLDivElement[];
      if (wraps.every((wrap) => !wrap.contains(event.target as Node))) {
        setAccountOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [accountOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [menuOpen]);

  return (
    <header
      ref={headerRef}
      className="border-ink sticky top-0 z-50 border-b-2 bg-white/90 backdrop-blur dark:bg-[#373b3e]/90"
    >
      <div className="relative flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-7">
          <Link
            href="/"
            onClick={SCROLL_TO_TOP}
            className={cn(
              'group flex items-center gap-3',
              isConventionPage && 'max-[900px]:hidden'
            )}
          >
            <span
              className={cn(
                'inline-block max-w-96 overflow-hidden whitespace-nowrap transition-[max-width] duration-300 ease-in-out',
                isConventionPage && nav?.sidebarCollapsed && 'max-w-0'
              )}
            >
              <span
                className={cn(
                  'font-display inline-block text-base tracking-wide transition-opacity duration-150 ease-in-out [text-shadow:2px_2px_0_color-mix(in_srgb,var(--ink)_22%,transparent)] sm:text-2xl',
                  isConventionPage && nav?.sidebarCollapsed ? 'opacity-0' : 'opacity-100 delay-300'
                )}
              >
                conmeet<span className="text-accent">.moe</span>
              </span>
            </span>
            <BrandMark className="gap-3" withSparkles />
          </Link>

          {isConventionPage && (
            <>
              <span aria-hidden className="border-ink hidden h-8 border-l-2 min-[900px]:block" />
              <IconButton
                onClick={() => nav?.setSidebarCollapsed(!nav?.sidebarCollapsed)}
                aria-label={nav?.sidebarCollapsed ? 'Expand sidebar' : 'Minimize sidebar'}
                aria-expanded={!nav?.sidebarCollapsed}
                className="hidden min-[900px]:inline-flex"
              >
                {nav?.sidebarCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </IconButton>
              <IconButton
                onClick={nav?.toggle}
                aria-label={nav?.open ? 'Close convention menu' : 'Open convention menu'}
                aria-expanded={nav?.open}
                className="hidden max-[900px]:inline-flex"
              >
                <PanelLeft className="h-4 w-4" />
              </IconButton>
            </>
          )}

          <nav className="hidden items-center gap-7 text-xs font-bold tracking-widest text-zinc-600 uppercase md:flex dark:text-zinc-300">
            <Link href="/conventions" className="hover:text-accent-pop transition-colors">
              Conventions
            </Link>
          </nav>
        </div>

        {isConventionPage && (
          <Link
            href="/"
            onClick={SCROLL_TO_TOP}
            aria-label="conmeet.moe home"
            className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center max-[900px]:flex"
          >
            <BrandMark className="gap-2" withSparkles />
          </Link>
        )}

        <HeaderActions
          isConventionPage={isConventionPage}
          menuOpen={menuOpen}
          onMenuToggle={() => {
            setAccountOpen(false);
            setMenuOpen((open) => !open);
          }}
          onAccountToggle={() => setAccountOpen((value) => !value)}
          headerUserWrap={headerUserWrap}
        />
      </div>

      <MobileMenu
        open={menuOpen}
        isConventionPage={isConventionPage}
        hideNav={hideNav}
        onClose={() => setMenuOpen(false)}
        onAccountToggle={() => {
          setAccountOpen((value) => !value);
          setMenuOpen(false);
        }}
        dropdownUserWrap={dropdownUserWrap}
      />

      {accountOpen &&
        user &&
        createPortal(
          <div
            ref={accountPopupWrap}
            className="border-ink fixed top-16 right-4 z-[70] w-48 rounded-none border-2 bg-white shadow-[3px_3px_0_var(--ink)] dark:bg-[#373b3e]"
          >
            <div className="border-ink border-b-2 border-dashed px-4 py-3">
              <p className="truncate text-sm font-bold">{user.display_name || user.username}</p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-300">@{user.username}</p>
            </div>
            <Link
              href="/settings"
              onClick={() => setAccountOpen(false)}
              className="hover:text-accent-pop block px-4 py-3 text-xs font-bold tracking-widest uppercase transition-colors"
            >
              Settings
            </Link>
            <button
              type="button"
              onClick={() => {
                setAccountOpen(false);
                logout();
              }}
              className="hover:text-accent-pop flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left text-xs font-bold tracking-widest uppercase transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Log out
            </button>
          </div>,
          document.body
        )}
    </header>
  );
}
