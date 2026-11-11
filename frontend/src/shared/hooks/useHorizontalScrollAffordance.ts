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
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const internalRef = useRef<HTMLDivElement | null>(null);

  const refCallback = useCallback(
    (el: HTMLDivElement | null) => {
      internalRef.current = el;
      if (externalRef && typeof externalRef !== 'function') {
        (externalRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }
      setNode(el);
    },
    [externalRef]
  );

  // Attach current property so callers expecting a RefObject can read ref.current
  (refCallback as unknown as { current: HTMLDivElement | null }).current =
    node || (externalRef && typeof externalRef !== 'function' ? externalRef.current : null);

  // Sync if externalRef.current was set directly
  useEffect(() => {
    if (externalRef && typeof externalRef !== 'function' && externalRef.current !== node) {
      setNode(externalRef.current);
    }
  });

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el =
      node ||
      (externalRef && typeof externalRef !== 'function' ? externalRef.current : null) ||
      internalRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > threshold);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - threshold);
  }, [node, externalRef, threshold]);

  useEffect(() => {
    const el =
      node ||
      (externalRef && typeof externalRef !== 'function' ? externalRef.current : null) ||
      internalRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });

    let observer: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;

    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(checkScroll);
      observer.observe(el);
      Array.from(el.children).forEach((child) => observer?.observe(child));
    }

    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => {
        checkScroll();
        if (observer) {
          Array.from(el.children).forEach((child) => observer?.observe(child));
        }
      });
      mutationObserver.observe(el, { childList: true, subtree: true });
    }

    return () => {
      el.removeEventListener('scroll', checkScroll);
      observer?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [node, externalRef, checkScroll]);

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
    ref: refCallback,
    canScrollLeft,
    canScrollRight,
    maskStyle,
    checkScroll,
  };
}
