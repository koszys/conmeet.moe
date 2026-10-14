import { ConventionGrid } from '@/features/conventions';

export default async function ConventionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const initialTab = params?.tab === 'past' ? 'past' : 'upcoming';

  return (
    <main className="flex w-full flex-1 flex-col">
      <ConventionGrid
        id="all-conventions"
        heading="all conventions"
        tagline="Browse what conventions are currently on this site."
        initialTab={initialTab}
        showRequest
      />
    </main>
  );
}
