'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/shared/lib/utils';

/**
 * @deprecated Navigation progress bar is deprecated in favor of centered `<MikuLoader />` transitions.
 * Preserved for reference or optional reactivation. Not mounted in active layout tree.
 */
export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [opacity, setOpacity] = useState(1);

  const startTimeRef = useRef<number>(0);
  const trickleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const completeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const minWaitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear all pending timers
  const clearAllTimers = () => {
    if (trickleIntervalRef.current) clearInterval(trickleIntervalRef.current);
    if (completeTimeoutRef.current) clearTimeout(completeTimeoutRef.current);
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    if (minWaitTimeoutRef.current) clearTimeout(minWaitTimeoutRef.current);
  };

  const startProgress = () => {
    clearAllTimers();
    startTimeRef.current = Date.now();
    setOpacity(1);
    setIsLoading(true);
    setProgress(35);

    // Progressive trickle curve
    trickleIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 88) return prev;
        const remaining = 90 - prev;
        const step = Math.max(2, remaining * 0.2);
        return Math.min(88, prev + step);
      });
    }, 150);

    // 10s safety reset
    safetyTimeoutRef.current = setTimeout(() => {
      completeProgress();
    }, 10_000);
  };

  const completeProgress = () => {
    const elapsed = Date.now() - startTimeRef.current;
    const remainingWait = Math.max(0, 260 - elapsed);

    minWaitTimeoutRef.current = setTimeout(() => {
      if (trickleIntervalRef.current) clearInterval(trickleIntervalRef.current);
      setProgress(100);

      completeTimeoutRef.current = setTimeout(() => {
        setOpacity(0);
        resetTimeoutRef.current = setTimeout(() => {
          setIsLoading(false);
          setProgress(0);
          setOpacity(1);
        }, 200);
      }, 150);
    }, remainingWait);
  };

  // When pathname or searchParams change, navigation has landed!
  useEffect(() => {
    if (isLoading) {
      completeProgress();
    }
  }, [pathname, searchParams]);

  // Global click interception on internal links
  useEffect(() => {
    function handleAnchorClick(e: MouseEvent) {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return; // Only left click
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // Modifier keys open new tabs

      const target = (e.target as Element).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Ignore special links
      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        target.hasAttribute('download') ||
        target.getAttribute('target') === '_blank'
      ) {
        return;
      }

      // Check URL origin
      try {
        const destUrl = new URL(href, window.location.href);
        if (destUrl.origin !== window.location.origin) return;

        // Ignore clicks to the exact same full URL (pathname + search + hash)
        if (
          destUrl.pathname === window.location.pathname &&
          destUrl.search === window.location.search &&
          destUrl.hash === window.location.hash
        ) {
          return;
        }

        // Internal navigation detected!
        startProgress();
      } catch {
        // Fallback: ignore malformed URLs
      }
    }

    document.addEventListener('click', handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleAnchorClick, { capture: true });
      clearAllTimers();
    };
  }, []);

  if (!isLoading && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 right-0 left-0 z-[9999] h-[3px] overflow-hidden"
    >
      <div
        className={cn(
          'from-accent via-accent-pop to-accent h-full bg-gradient-to-r shadow-[0_0_8px_var(--accent)] transition-all duration-200 ease-out',
          progress === 100 && 'duration-150'
        )}
        style={{
          width: `${progress}%`,
          opacity,
        }}
      />
    </div>
  );
}
