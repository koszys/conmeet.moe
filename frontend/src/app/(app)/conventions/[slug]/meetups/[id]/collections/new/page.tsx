import type { Metadata } from 'next';
import { RequireAuth } from '@/features/auth';
import { AlbumUploadForm } from '@/features/meetups';

export const metadata: Metadata = {
  title: 'Create Photo Album',
  description: 'Upload a photo collection or album for this meetup.',
};

export default async function NewAlbumPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const meetupId = parseInt(id, 10);

  return (
    <RequireAuth>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <AlbumUploadForm conventionSlug={slug} meetupId={meetupId} />
      </div>
    </RequireAuth>
  );
}
