import { FreebieBoard } from '@/features/freebies';

export default async function ConventionFreebiesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <FreebieBoard conventionSlug={slug} />
    </div>
  );
}
