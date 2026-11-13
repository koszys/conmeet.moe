'use client';

import { useEffect } from 'react';

const LANDING_SECTION_IDS = ['conventions', 'featured-conventions', 'features'] as const;

export function useLandingScrollSpy(isLoading: boolean) {
  // Scroll-spy: keep URL hash in sync with the section currently in view (only on active user scroll)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;

    let userHasScrolled = false;
    const onUserScroll = () => {
      userHasScrolled = true;
    };

    window.addEventListener('wheel', onUserScroll, { passive: true });
    window.addEventListener('touchmove', onUserScroll, { passive: true });
    window.addEventListener('keydown', onUserScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        // Only update hash if the user has physically scrolled/interacted with the page
        if (!userHasScrolled) return;

        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) {
          // If scrolled near top of page (Hero area), clear any section hash
          if (window.scrollY < 200 && window.location.hash) {
            window.history.replaceState(
              null,
              '',
              window.location.pathname + window.location.search
            );
          }
          return;
        }

        // Pick the intersecting section with highest visibility ratio
        const best = visible.reduce((max, curr) =>
          curr.intersectionRatio > max.intersectionRatio ? curr : max
        );

        const newHash = `#${best.target.id}`;
        if (window.location.hash !== newHash) {
          window.history.replaceState(
            null,
            '',
            window.location.pathname + window.location.search + newHash
          );
        }
      },
      {
        rootMargin: '-15% 0px -35% 0px',
        threshold: [0.15, 0.4, 0.7],
      }
    );

    LANDING_SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener('wheel', onUserScroll);
      window.removeEventListener('touchmove', onUserScroll);
      window.removeEventListener('keydown', onUserScroll);
      observer.disconnect();
    };
  }, [isLoading]);

  // Ensure scroll position accurately respects target hash (e.g. #conventions or #featured-conventions) after hydration & layout settle
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (!hash) return;
    const id = hash.replace('#', '');

    let cancelled = false;
    const cancelScroll = () => {
      cancelled = true;
    };

    window.addEventListener('wheel', cancelScroll, { passive: true, once: true });
    window.addEventListener('touchmove', cancelScroll, { passive: true, once: true });

    const scrollToTarget = () => {
      if (cancelled) return;
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'auto' });
      }
    };

    scrollToTarget();
    const frameId = requestAnimationFrame(scrollToTarget);
    const t1 = setTimeout(scrollToTarget, 100);
    const t2 = setTimeout(scrollToTarget, 300);

    return () => {
      window.removeEventListener('wheel', cancelScroll);
      window.removeEventListener('touchmove', cancelScroll);
      cancelAnimationFrame(frameId);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isLoading]);
}
