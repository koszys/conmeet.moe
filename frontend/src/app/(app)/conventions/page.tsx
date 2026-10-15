import type { Metadata } from 'next';
import { ConventionGrid } from '@/features/conventions';

export const metadata: Metadata = {
  title: 'All Cons',
  description: 'Browse all conventions currently listed on conmeet.moe.',
};

export default async function ConventionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const initialTab = params?.tab === 'past' ? 'past' : 'upcoming';

  return (
    <main className="flex w-full flex-1 flex-col">
      <ConventionGrid
        id="all-conventions"
        heading="all cons"
        tagline="Browse what conventions are currently on this site."
        initialTab={initialTab}
        showFeaturedLink
        showRequest
      />
    </main>
  );
}
