'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { CONBLOCK_PRIMARY } from '@/shared/components/ui';
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
        'group fixed right-5 z-40 sm:right-6',
        footerOffset === 0 && 'bottom-5 sm:bottom-6',
        CONBLOCK_PRIMARY,
        'inline-flex items-center gap-1.5 px-3 py-2 select-none',
        'focus-visible:ring-accent focus-visible:ring-2 focus-visible:outline-none',
        isVisible
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0'
      )}
    >
      <ArrowUp className="h-3.5 w-3.5 stroke-3 transition-transform group-hover:-translate-y-0.5" />
      <span className="font-display text-[10px] tracking-widest">TOP</span>
    </button>
  );
}
