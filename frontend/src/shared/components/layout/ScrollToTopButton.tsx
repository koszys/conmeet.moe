'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { CONBLOCK_PRIMARY } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(0);
  const isScrollingToTopRef = useRef(false);

  useEffect(() => {
    let ticking = false;

    function updatePosition() {
      if (window.scrollY <= 10) {
        isScrollingToTopRef.current = false;
      }

      if (!isScrollingToTopRef.current) {
        setIsVisible(window.scrollY > 300);
      }

      // Check footer overlap
      const footer = document.querySelector('footer');
      let fOffset = 0;
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const overlap = window.innerHeight - footerRect.top;
        if (overlap > 0) {
          fOffset = overlap + 16;
        }
      }

      // Check floating bar overlap (e.g. AlbumSelectionBar)
      const floatingBar = document.querySelector('[data-floating-bar]');
      let barOffset = 0;
      if (floatingBar) {
        const barRect = floatingBar.getBoundingClientRect();
        // Check if bar is visible in viewport and overlaps horizontally with the button area (right-side ~80px)
        const buttonLeft = window.innerWidth - 80;
        if (barRect.right > buttonLeft && barRect.bottom > 0 && barRect.top < window.innerHeight) {
          const overlap = window.innerHeight - barRect.top;
          if (overlap > 0) {
            barOffset = overlap + 12;
          }
        }
      }

      // Check pagination overlap (e.g. Comments pagination on mobile)
      const pagination = document.querySelector('[data-pagination]');
      let pagOffset = 0;
      if (pagination) {
        const pagRect = pagination.getBoundingClientRect();
        if (pagRect.top < window.innerHeight && pagRect.bottom > 0) {
          const overlap = window.innerHeight - pagRect.top;
          if (overlap > 0) {
            pagOffset = overlap + 16;
          }
        }
      }

      setBottomOffset(Math.max(fOffset, barOffset, pagOffset));
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updatePosition();
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

    // Watch for DOM changes (e.g. floating bar appearing/disappearing)
    const observer = new MutationObserver(() => {
      onScroll();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('wheel', onUserInterrupt);
      window.removeEventListener('touchmove', onUserInterrupt);
      observer.disconnect();
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
      style={bottomOffset > 0 ? { bottom: `${bottomOffset}px` } : undefined}
      className={cn(
        'group fixed right-5 z-40 transition-[bottom,transform,opacity] duration-200 sm:right-6',
        bottomOffset === 0 && 'bottom-5 sm:bottom-6',
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
