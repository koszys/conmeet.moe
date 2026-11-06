import type { Metadata } from 'next';
import { RequireAuth } from '@/features/auth';
import { MeetupForm } from '@/features/meetups';

export const metadata: Metadata = {
  title: 'Host a Meetup',
  description: 'Organize a meetup or cosplay gathering for this convention.',
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
