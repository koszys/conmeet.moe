import type { Metadata } from 'next';
import { MeetupCollectionsView } from '@/features/meetups';

export const metadata: Metadata = {
  title: 'Photo Collections',
  description: 'Browse attendee photos and albums from this meetup.',
};

export default async function MeetupCollectionsPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const meetupId = parseInt(id, 10);

  return <MeetupCollectionsView conventionSlug={slug} meetupId={meetupId} />;
}
