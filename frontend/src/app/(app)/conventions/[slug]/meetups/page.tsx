import type { Metadata } from 'next';
import { MeetupList } from '@/features/meetups';

export const metadata: Metadata = {
  title: 'Cosplay Meetups',
  description: 'Community & official gatherings, cosplay meetups, and fan photoshoots.',
};

export default async function ConventionMeetupsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <MeetupList conventionSlug={slug} />
    </div>
  );
}
