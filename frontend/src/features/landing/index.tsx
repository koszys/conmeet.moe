import { Hero } from './components/Hero';
import { LedDisplay } from './components/LedDisplay';
import { Features } from './components/Features';
import { ConventionGrid } from '@/features/conventions';

export function Landing() {
  return (
    <main className="flex-1">
      <Hero />
      <LedDisplay />
      <Features />
      <ConventionGrid />
    </main>
  );
}
