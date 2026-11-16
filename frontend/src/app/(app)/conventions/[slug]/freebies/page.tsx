import { Suspense } from 'react';
import type { Metadata } from 'next';
import { FreebieBoard } from '@/features/freebies';
import { MikuLoader } from '@/shared/components/miku';

export const metadata: Metadata = {
  title: 'Freebies',
  description: 'User uploaded freebies for this convention.',
};

export default async function ConventionFreebiesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] w-full flex-col items-center justify-center py-12">
            <MikuLoader message="Scanning for freebies..." size="lg" />
          </div>
        }
      >
        <FreebieBoard conventionSlug={slug} />
      </Suspense>
    </div>
  );
}
