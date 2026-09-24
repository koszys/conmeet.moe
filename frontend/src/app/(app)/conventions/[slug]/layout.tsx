import type { ReactNode } from 'react';
import { ConventionSidebar } from '@/features/conventions';
import { Footer } from '@/shared/components/layout/Footer';

export default async function ConventionLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-1 flex-col min-[900px]:flex-row">
      <ConventionSidebar slug={slug} />
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </div>
  );
}
