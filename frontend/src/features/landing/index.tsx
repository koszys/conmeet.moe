import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { Features } from './components/Features';
import { ConventionGrid } from '@/features/conventions';

export function Landing() {
  return (
    <main className="flex-1">
      <Hero />
      <Marquee />
      <Features />
      <ConventionGrid />
    </main>
  );
}
