import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { ConventionGrid } from '@/features/conventions';

export function Landing() {
  return (
    <main className="flex-1">
      <Hero />
      <Features />
      <section id="conventions" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-8 pb-24 md:px-6">
        <ConventionGrid />
      </section>
    </main>
  );
}
