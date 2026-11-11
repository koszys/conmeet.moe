import { MikuLoader } from '@/shared/components/miku';

export default function ConventionDetailLoading() {
  return (
    <main className="flex min-h-[60vh] w-full flex-1 items-center justify-center px-4 py-16">
      <MikuLoader message="Loading convention overview..." size="lg" />
    </main>
  );
}
