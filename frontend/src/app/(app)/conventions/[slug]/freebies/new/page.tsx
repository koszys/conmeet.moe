import { RequireAuth } from '@/features/auth';
import { FreebieForm } from '@/features/freebies';

export default async function NewFreebiePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <RequireAuth>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <FreebieForm conventionSlug={slug} />
      </div>
    </RequireAuth>
  );
}
