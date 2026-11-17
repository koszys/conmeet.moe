import type { Metadata } from 'next';
import { AlbumDetailView } from '@/features/meetups';

export const metadata: Metadata = {
  title: 'Photo Album',
  description: 'View photos, photographer credits, and download images from this meetup album.',
};

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ slug: string; id: string; albumId: string }>;
}) {
  const { slug, id, albumId } = await params;

  return <AlbumDetailView conventionSlug={slug} meetupId={id} albumId={albumId} />;
}
