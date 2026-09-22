'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { ConventionSidebar } from './ConventionSidebar';
import { cn } from '@/shared/lib/utils';

const CONVENTION_PATH = /^\/conventions\/([^/]+)(?:\/.*)?$/;

export function isConventionDetailPath(pathname: string | null): boolean {
  return pathname != null && CONVENTION_PATH.test(pathname);
}

const SIDEBAR_STORAGE_KEY = 'conmeet:sidebar-collapsed';
const SIDEBAR_EVENT = 'conmeet-sidebar-change';

function getSidebarSnapshot(): boolean {
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function getSidebarServerSnapshot(): boolean {
  return false;
}

function subscribeSidebar(onStoreChange: () => void) {
  window.addEventListener(SIDEBAR_EVENT, onStoreChange);
  window.addEventListener('storage', onStoreChange);
  return () => {
    window.removeEventListener(SIDEBAR_EVENT, onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
}

interface ConventionNavValue {
  open: boolean;
  toggle: () => void;
  close: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isMounted: boolean;
}

const ConventionNavContext = createContext<ConventionNavValue | null>(null);

export function useConventionNav() {
  return useContext(ConventionNavContext);
}

export function ConventionNavProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sidebarCollapsed = useSyncExternalStore(
    subscribeSidebar,
    getSidebarSnapshot,
    getSidebarServerSnapshot
  );

  const setSidebarCollapsed = (collapsed: boolean) => {
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? '1' : '0');
      window.dispatchEvent(new Event(SIDEBAR_EVENT));
    } catch {
      // Ignore storage write errors (e.g. private browsing)
    }
  };

  const slug = useMemo(() => {
    const match = CONVENTION_PATH.exec(pathname ?? '');
    return match ? match[1] : null;
  }, [pathname]);

  const [lastPathname, setLastPathname] = useState<string | null>(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  const value = useMemo(
    () => ({
      open,
      toggle: () => setOpen((value) => !value),
      close: () => setOpen(false),
      sidebarCollapsed,
      setSidebarCollapsed,
      isMounted,
    }),
    [open, sidebarCollapsed, isMounted]
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
