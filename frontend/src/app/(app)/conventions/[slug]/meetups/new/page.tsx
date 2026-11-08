import type { Metadata } from 'next';
import { RequireAuth } from '@/features/auth';
import { MeetupForm } from '@/features/meetups';

export const metadata: Metadata = {
  title: 'Post a Meetup',
  description: 'Post a community or official meetup for this convention.',
};

export default async function NewMeetupPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <RequireAuth>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <MeetupForm conventionSlug={slug} />
      </div>
    </RequireAuth>
  );
}
