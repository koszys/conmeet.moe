import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ConventionsHub } from '@/features/conventions';

export const metadata: Metadata = {
  title: 'Featured Cons',
  description: 'Featured conventions on conmeet.moe.',
};

export default async function FeaturedConventionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const initialTab = params?.tab === 'past' ? 'past' : 'upcoming';

  return (
    <main className="flex w-full flex-1 flex-col">
      <Suspense fallback={null}>
        <ConventionsHub initialView="featured" initialTab={initialTab} />
      </Suspense>
    </main>
  );
}
