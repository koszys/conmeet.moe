import { ConventionsHubSkeleton } from '@/features/conventions';

export default function ConventionsLoading() {
  return (
    <main className="flex w-full flex-1 flex-col">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
        <ConventionsHubSkeleton view="featured" />
      </div>
    </main>
  );
}
