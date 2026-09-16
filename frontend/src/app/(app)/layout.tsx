import type { ReactNode } from 'react';
import { Header } from '@/shared/components/layout/Header';
import { Footer } from '@/shared/components/layout/Footer';
import { ConventionNavProvider } from '@/features/conventions/components/ConventionNavProvider';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ConventionNavProvider>
      <div className="flex flex-1 flex-col">
        <Header />
        {children}
        <Footer />
      </div>
    </ConventionNavProvider>
  );
}
