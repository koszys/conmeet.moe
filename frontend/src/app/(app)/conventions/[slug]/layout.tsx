import type { ReactNode } from 'react';
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
    <div className="flex w-full flex-1 flex-col min-[900px]:flex-row">
      <ConventionSidebar slug={slug} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
