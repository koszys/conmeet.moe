import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ConventionsHub } from '@/features/conventions';

export const metadata: Metadata = {
  title: 'All Cons',
  description: 'Browse all conventions currently listed on conmeet.moe.',
};

export default async function ConventionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string; view?: string }>;
}) {
  const params = await searchParams;
  const initialView = params?.view === 'list' ? 'list' : 'featured';
  const initialTab = params?.tab === 'past' ? 'past' : 'upcoming';

  return (
    <main className="flex w-full flex-1 flex-col">
      <Suspense fallback={null}>
        <ConventionsHub initialView={initialView} initialTab={initialTab} />
      </Suspense>
    </main>
  );
}
