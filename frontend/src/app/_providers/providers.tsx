'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/features/auth/auth-provider';
import { ConventionNavProvider } from '@/features/conventions/components/ConventionNavProvider';
import { Header } from '@/shared/components/layout/Header';
import { Footer } from '@/shared/components/layout/Footer';
import { ThemeProvider } from './theme-provider';

function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
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
              <Footer />
            </div>
          </ConventionNavProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
