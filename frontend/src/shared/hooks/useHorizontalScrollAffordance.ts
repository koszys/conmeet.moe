'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface UseHorizontalScrollAffordanceOptions {
  ref?: React.RefObject<HTMLDivElement | null>;
  fadeWidth?: number;
  threshold?: number;
}

export function useHorizontalScrollAffordance({
  ref: externalRef,
  fadeWidth = 28,
  threshold = 2,
}: UseHorizontalScrollAffordanceOptions = {}) {
  const internalRef = useRef<HTMLDivElement>(null);
  const scrollRef = externalRef || internalRef;

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > threshold);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - threshold);
  }, [scrollRef, threshold]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(checkScroll);
      observer.observe(el);
      Array.from(el.children).forEach((child) => observer?.observe(child));
    }

    return () => {
      el.removeEventListener('scroll', checkScroll);
      observer?.disconnect();
    };
  }, [scrollRef, checkScroll]);

  const maskStyle = useMemo<React.CSSProperties | undefined>(() => {
    if (!canScrollLeft && !canScrollRight) return undefined;
    const leftStop = canScrollLeft ? `transparent 0px, black ${fadeWidth}px` : 'black 0px';
    const rightStop = canScrollRight
      ? `black calc(100% - ${fadeWidth}px), transparent 100%`
      : 'black 100%';
    const grad = `linear-gradient(to right, ${leftStop}, ${rightStop})`;
    return {
      maskImage: grad,
      WebkitMaskImage: grad,
    };
  }, [canScrollLeft, canScrollRight, fadeWidth]);

  return {
    ref: scrollRef,
    canScrollLeft,
    canScrollRight,
    maskStyle,
    checkScroll,
  };
}
