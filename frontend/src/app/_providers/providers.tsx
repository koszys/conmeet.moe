'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/features/auth';
import { ConventionNavProvider, isConventionDetailPath } from '@/features/conventions';
import { Header } from '@/shared/components/layout/Header';
import { Footer } from '@/shared/components/layout/Footer';
import { ThemeProvider } from './ThemeProvider';

function ScrollToTop() {
  const pathname = usePathname();
  const isPopStateRef = useRef(false);
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    function onPopState() {
      isPopStateRef.current = true;
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    // If it's the initial mount / page refresh (pathname hasn't changed), do not scroll
    if (prevPathnameRef.current === pathname) {
      return;
    }

    const wasPopState = isPopStateRef.current;
    isPopStateRef.current = false;
    prevPathnameRef.current = pathname;

    // Only scroll to top on forward navigation (not on browser back/forward)
    if (!wasPopState && !window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isConventionPage = isConventionDetailPath(pathname);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ConventionNavProvider>
            <ScrollToTop />
            <div className="flex min-h-full flex-1 flex-col">
              <Header />
              <main className="flex flex-1 flex-col">{children}</main>
              {!isConventionPage && <Footer />}
            </div>
          </ConventionNavProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
