import { ConventionGrid } from '@/features/conventions';

export default function ConventionsPage() {
  return (
    <main className="flex w-full flex-1 flex-col">
      <ConventionGrid
        id="all-conventions"
        heading="all conventions"
        tagline="Browse what conventions are currently on this site."
        showRequest
      />
    </main>
  );
}
