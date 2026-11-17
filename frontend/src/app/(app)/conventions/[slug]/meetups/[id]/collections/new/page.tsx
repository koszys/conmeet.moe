import { redirect } from 'next/navigation';

export default async function LegacyNewCollectionsRedirect({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  redirect(`/conventions/${slug}/meetups/${id}/gallery/new`);
}
