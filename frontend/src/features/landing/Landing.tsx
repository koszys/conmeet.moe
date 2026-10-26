'use client';

import { useEffect } from 'react';
import { Hero } from './components/Hero';
import { LedDisplay } from './components/LedDisplay';
import { Features } from './components/Features';
import { FeaturedConventions } from './components/FeaturedConventions';
import { ConventionGrid } from '@/features/conventions';
import { useConventions } from '@/features/conventions/data/api';

export function Landing() {
  const { isLoading } = useConventions();

  // Ensure scroll position accurately respects target hash (e.g. #conventions) after hydration/loading
  useEffect(() => {
    if (isLoading || typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (!hash) return;
    const id = hash.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'auto' });
    }
  }, [isLoading]);
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
        limitRecentlyEnded={8}
        className="pt-12 pb-20 md:pt-16"
      />
    </main>
  );
}
