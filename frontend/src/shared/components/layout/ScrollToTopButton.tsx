'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsVisible(window.scrollY > 300);
          ticking = false;
        });
        ticking = true;
      }
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleScrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <button
      type="button"
      onClick={handleScrollToTop}
      aria-label="Scroll back to top"
      className={cn(
        'group border-ink fixed right-5 bottom-5 z-40 sm:right-6 sm:bottom-6',
        'inline-flex cursor-pointer items-center gap-1.5 border-2 px-3 py-2 text-xs font-bold uppercase select-none',
        'bg-white text-zinc-900 shadow-[3px_3px_0_var(--ink)] dark:bg-zinc-900 dark:text-zinc-100',
        'hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0_var(--ink)] active:translate-x-1 active:translate-y-1 active:shadow-none',
        'focus-visible:ring-accent focus-visible:ring-2 focus-visible:outline-none',
        'transition-all duration-200 ease-in-out',
        isVisible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0'
      )}
    >
      <ArrowUp className="text-accent h-3.5 w-3.5 stroke-3 transition-transform group-hover:-translate-y-0.5" />
      <span className="font-display text-[10px] tracking-widest">TOP</span>
    </button>
  );
}
