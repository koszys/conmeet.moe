import type { Metadata } from 'next';
import { MeetupDetailView } from '@/features/meetups';

export const metadata: Metadata = {
  title: 'Meetup Details',
  description: 'View meetup schedule, location, and attendee photo gallery.',
};

export default async function MeetupPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;

  return <MeetupDetailView conventionSlug={slug} meetupId={id} />;
}
