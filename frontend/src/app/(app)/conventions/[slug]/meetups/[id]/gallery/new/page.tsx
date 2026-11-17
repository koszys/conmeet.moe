import type { Metadata } from 'next';
import { RequireAuth } from '@/features/auth';
import { AlbumUploadForm } from '@/features/meetups';

export const metadata: Metadata = {
  title: 'Upload Photo Album',
  description: 'Share your photos and tag your social media handles for this meetup.',
};

export default async function NewAlbumPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;

  return (
    <RequireAuth>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <AlbumUploadForm conventionSlug={slug} meetupId={id} />
      </div>
    </RequireAuth>
  );
}
