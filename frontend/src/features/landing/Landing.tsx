import { Hero } from './components/Hero';
import { LedDisplay } from './components/LedDisplay';
import { Features } from './components/Features';
import { FeaturedConventions } from './components/FeaturedConventions';
import { ConventionGrid } from '@/features/conventions';

export function Landing() {
  return (
    <main className="flex-1">
      <Hero />
      <LedDisplay />
      <Features />
      <FeaturedConventions />
      <ConventionGrid
        showAllLink
        limitNow={4}
        limitSoon={4}
        limitUp={4}
        limitPast={8}
        className="pt-12 pb-20 md:pt-16"
      />
    </main>
  );
}
