import type { Metadata } from 'next';
import { MeetupGalleryView } from '@/features/meetups';

export const metadata: Metadata = {
  title: 'Photo Gallery',
  description: 'Browse attendee photo albums and memories from this meetup.',
};

export default async function MeetupGalleryPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;

  return <MeetupGalleryView conventionSlug={slug} meetupId={id} />;
}
