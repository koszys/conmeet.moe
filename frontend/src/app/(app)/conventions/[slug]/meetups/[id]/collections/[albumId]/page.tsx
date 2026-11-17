import { redirect } from 'next/navigation';

export default async function LegacyAlbumRedirect({
  params,
}: {
  params: Promise<{ slug: string; id: string; albumId: string }>;
}) {
  const { slug, id, albumId } = await params;
  redirect(`/conventions/${slug}/meetups/${id}/gallery/${albumId}`);
}
