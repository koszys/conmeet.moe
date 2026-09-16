'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ConventionSidebar } from './ConventionSidebar';
import { cn } from '@/shared/lib/utils';

const CONVENTION_PATH = /^\/conventions\/([^/]+)$/;

export function isConventionDetailPath(pathname: string | null): boolean {
  return pathname != null && CONVENTION_PATH.test(pathname);
}

interface ConventionNavValue {
  open: boolean;
  toggle: () => void;
  close: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const ConventionNavContext = createContext<ConventionNavValue | null>(null);

export function useConventionNav() {
  return useContext(ConventionNavContext);
}

export function ConventionNavProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('conmeet:sidebar-collapsed') === '1';
  });

  useEffect(() => {
    window.localStorage.setItem('conmeet:sidebar-collapsed', sidebarCollapsed ? '1' : '0');
  }, [sidebarCollapsed]);

  const slug = useMemo(() => {
    const match = CONVENTION_PATH.exec(pathname ?? '');
    return match ? match[1] : null;
  }, [pathname]);

  const [lastSlug, setLastSlug] = useState<string | null>(slug);

  if (slug !== lastSlug) {
    setLastSlug(slug);
    setOpen(false);
  }

  const value = useMemo(
    () => ({
      open,
      toggle: () => setOpen((value) => !value),
      close: () => setOpen(false),
      sidebarCollapsed,
      setSidebarCollapsed,
    }),
    [open, sidebarCollapsed]
  );

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  return (
    <ConventionNavContext.Provider value={value}>
      {children}
      {slug && (
        <>
          <div
            onClick={() => setOpen(false)}
            aria-hidden="true"
            className={cn(
              'bg-ink/40 fixed inset-0 z-[55] hidden transition-opacity duration-300 max-[900px]:block',
              open ? 'opacity-100' : 'pointer-events-none opacity-0'
            )}
          />

          <div
            className={cn(
              'fixed inset-y-0 left-0 z-[60] hidden w-72 transition-transform duration-300 ease-in-out max-[900px]:block',
              open ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            <ConventionSidebar slug={slug} variant="drawer" onClose={() => setOpen(false)} />
          </div>
        </>
      )}
    </ConventionNavContext.Provider>
  );
}
