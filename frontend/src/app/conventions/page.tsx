import { Footer } from '@/shared/components/layout/Footer';
import { Header } from '@/shared/components/layout/Header';
import { ConventionGrid } from '@/features/conventions';

export default function ConventionsPage() {
  return (
    <>
      <Header />
      <main className="flex w-full flex-1 flex-col">
        <ConventionGrid
          id="all-conventions"
          heading="all conventions"
          tagline="Every convention currently on the site — browse the full line-up, not just what's up next."
          showRequest
        />
      </main>
      <Footer />
    </>
  );
}