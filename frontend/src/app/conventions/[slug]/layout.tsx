import type { ReactNode } from 'react';
import { Footer } from '@/shared/components/layout/Footer';
import { Header } from '@/shared/components/layout/Header';
import { ConventionSidebar } from '@/features/conventions';

export default async function ConventionLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <div className="flex w-full flex-1 md:flex-row">
        <ConventionSidebar slug={slug} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      <Footer />
    </div>
  );
}