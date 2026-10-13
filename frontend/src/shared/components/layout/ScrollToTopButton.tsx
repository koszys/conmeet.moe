'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [footerOffset, setFooterOffset] = useState(0);
  const isScrollingToTopRef = useRef(false);

  useEffect(() => {
    let ticking = false;

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY <= 10) {
            isScrollingToTopRef.current = false;
          }

          if (!isScrollingToTopRef.current) {
            setIsVisible(window.scrollY > 300);
          }

          const footer = document.querySelector('footer');
          if (footer) {
            const footerRect = footer.getBoundingClientRect();
            const overlap = window.innerHeight - footerRect.top;
            setFooterOffset(overlap > 0 ? overlap + 16 : 0);
          } else {
            setFooterOffset(0);
          }

          ticking = false;
        });
        ticking = true;
      }
    }

    function onUserInterrupt() {
      isScrollingToTopRef.current = false;
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('wheel', onUserInterrupt, { passive: true });
    window.addEventListener('touchmove', onUserInterrupt, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('wheel', onUserInterrupt);
      window.removeEventListener('touchmove', onUserInterrupt);
    };
  }, []);

  function handleScrollToTop() {
    isScrollingToTopRef.current = true;
    setIsVisible(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <button
      type="button"
      onClick={handleScrollToTop}
      aria-label="Scroll back to top"
      style={footerOffset > 0 ? { bottom: `${footerOffset}px` } : undefined}
      className={cn(
        'group border-ink fixed right-5 z-40 sm:right-6',
        footerOffset === 0 && 'bottom-5 sm:bottom-6',
        'inline-flex cursor-pointer items-center gap-1.5 border-2 px-3 py-2 text-xs font-bold uppercase select-none',
        'bg-accent hover:bg-accent-pop dark:hover:bg-accent-pop text-white shadow-[3px_3px_0_var(--ink)] dark:text-zinc-950 dark:hover:text-white',
        'hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0_var(--ink)] active:translate-x-1 active:translate-y-1 active:shadow-none',
        'focus-visible:ring-accent focus-visible:ring-2 focus-visible:outline-none',
        'transition-all duration-300 ease-in-out',
        isVisible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0'
      )}
    >
      <ArrowUp className="h-3.5 w-3.5 stroke-3 transition-transform group-hover:-translate-y-0.5" />
      <span className="font-display text-[10px] tracking-widest">TOP</span>
    </button>
  );
}
