'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Pause,
  Play,
  Sparkles,
} from 'lucide-react';
import type { Convention, ConventionPhase } from '../../types';
import { getConventionPhase } from '../../utils/dates';
import { formatDateRange } from '@/shared/lib/dates';
import { CONBLOCK } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { ConventionExternalLinks } from '../links/ConventionExternalLinks';

const PHASE_CONFIG: Record<ConventionPhase, { label: string; chipClass: string }> = {
  now: {
    label: 'HAPPENING NOW',
    chipClass: 'bg-accent-pop text-white',
  },
  soon: {
    label: 'SOON!',
    chipClass: 'bg-accent text-white dark:text-zinc-950',
  },
  up: {
    label: 'COMING UP',
    chipClass: 'bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-100',
  },
  past: {
    label: 'ENDED',
    chipClass:
      'border-zinc-400 bg-zinc-200 text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
  },
};

export interface FeaturedConventionSliderProps {
  conventions: Convention[];
  className?: string;
  autoSlideInterval?: number;
}

export function FeaturedConventionSlider({
  conventions,
  className,
  autoSlideInterval = 5000,
}: FeaturedConventionSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [progress, setProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const total = conventions.length;

  // Multi-copy loop for infinite cylindrical scrolling
  const copies = total > 1 ? Math.max(3, Math.ceil(15 / total)) : 1;
  const middleCopyIndex = Math.floor(copies / 2);

  // Flattened array of repeated conventions
  const items = useMemo(() => {
    if (total <= 1) {
      return conventions.map((conv, idx) => ({
        conv,
        originalIndex: idx,
        copyIndex: 0,
        globalIndex: idx,
        key: `${conv.id}-0-0`,
      }));
    }

    const result: {
      conv: Convention;
      originalIndex: number;
      copyIndex: number;
      globalIndex: number;
      key: string;
    }[] = [];

    let count = 0;
    for (let c = 0; c < copies; c++) {
      for (let i = 0; i < total; i++) {
        result.push({
          conv: conventions[i],
          originalIndex: i,
          copyIndex: c,
          globalIndex: count++,
          key: `${conventions[i].id}-${c}-${i}`,
        });
      }
    }
    return result;
  }, [conventions, copies, total]);

  const centeredGlobalIndexRef = useRef<number>(middleCopyIndex * total);
  const isProgrammaticScrollRef = useRef(false);
  const hasCenteredInitialRef = useRef(false);

  // Center an element within the scroll container
  const centerItemInViewport = useCallback((element: HTMLElement, smooth = true) => {
    const list = listRef.current;
    if (!list || !element) return;
    const targetTop = element.offsetTop - (list.clientHeight - element.clientHeight) / 2;
    list.scrollTo({ top: targetTop, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  // Center a convention by globalIndex and update state
  const goToGlobalIndex = useCallback(
    (targetGlobalIndex: number, smooth = true) => {
      const targetItem = items[targetGlobalIndex];
      if (!targetItem) return;

      setCurrentIndex(targetItem.originalIndex);
      centeredGlobalIndexRef.current = targetGlobalIndex;

      const el = itemRefs.current[targetGlobalIndex];
      if (el) {
        isProgrammaticScrollRef.current = true;
        centerItemInViewport(el, smooth);
        setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 400);
      }
    },
    [items, centerItemInViewport]
  );

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    let nextGlobal = centeredGlobalIndexRef.current + 1;
    // Maintain position within middle repetition range
    if (nextGlobal >= total * (copies - 1)) {
      const list = listRef.current;
      const cycleHeight =
        (itemRefs.current[total]?.offsetTop ?? 0) - (itemRefs.current[0]?.offsetTop ?? 0);
      if (list && cycleHeight > 0) {
        list.scrollTop -= cycleHeight;
        nextGlobal -= total;
      }
    }
    goToGlobalIndex(nextGlobal, true);
  }, [total, copies, goToGlobalIndex]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    let prevGlobal = centeredGlobalIndexRef.current - 1;
    // Maintain position within middle repetition range
    if (prevGlobal < total) {
      const list = listRef.current;
      const cycleHeight =
        (itemRefs.current[total]?.offsetTop ?? 0) - (itemRefs.current[0]?.offsetTop ?? 0);
      if (list && cycleHeight > 0) {
        list.scrollTop += cycleHeight;
        prevGlobal += total;
      }
    }
    goToGlobalIndex(prevGlobal, true);
  }, [total, copies, goToGlobalIndex]);

  // Initial Centering: Position highest priority convention (index 0) in the middle slot
  useEffect(() => {
    if (total <= 1 || hasCenteredInitialRef.current) return;
    const initialGlobalIndex = middleCopyIndex * total;

    const timer = requestAnimationFrame(() => {
      const initialEl = itemRefs.current[initialGlobalIndex];
      if (initialEl) {
        centerItemInViewport(initialEl, false);
        hasCenteredInitialRef.current = true;
        centeredGlobalIndexRef.current = initialGlobalIndex;
      }
    });

    return () => cancelAnimationFrame(timer);
  }, [total, middleCopyIndex, centerItemInViewport, items]);

  // Window resize re-centering
  useEffect(() => {
    if (total <= 1) return;
    const handleResize = () => {
      const currentEl = itemRefs.current[centeredGlobalIndexRef.current];
      if (currentEl) {
        centerItemInViewport(currentEl, false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [total, centerItemInViewport]);

  // Infinite Scroll Wrapping: Silent modulo scroll shift on manual boundary reach
  useEffect(() => {
    const list = listRef.current;
    if (!list || total <= 1) return;

    const handleScroll = () => {
      if (isProgrammaticScrollRef.current) return;

      const cycleHeight =
        (itemRefs.current[total]?.offsetTop ?? 0) - (itemRefs.current[0]?.offsetTop ?? 0);
      if (cycleHeight <= 0) return;

      if (list.scrollTop < cycleHeight * 0.5) {
        list.scrollTop += cycleHeight;
        centeredGlobalIndexRef.current += total;
      } else if (list.scrollTop > cycleHeight * (copies - 1.5)) {
        list.scrollTop -= cycleHeight;
        centeredGlobalIndexRef.current -= total;
      }
    };

    list.addEventListener('scroll', handleScroll, { passive: true });
    return () => list.removeEventListener('scroll', handleScroll);
  }, [total, copies]);

  // Dual edge fade mask for infinite cylindrical roller
  const maskStyle = useMemo<React.CSSProperties | undefined>(() => {
    if (total <= 1) return undefined;
    return {
      maskImage:
        'linear-gradient(to bottom, transparent 0%, black 36px, black calc(100% - 36px), transparent 100%)',
      WebkitMaskImage:
        'linear-gradient(to bottom, transparent 0%, black 36px, black calc(100% - 36px), transparent 100%)',
    };
  }, [total]);

  // Intersection Observer: Only slide when in viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Reset elapsed time & progress when active convention changes
  useEffect(() => {
    elapsedRef.current = 0;
    setProgress(0);
    lastTimeRef.current = null;
  }, [currentIndex]);

  const isTimerActive = isInView && !isPaused && !isManuallyPaused && total > 1;

  // Precision Timer Loop: Pauses at the exact time without restarting
  useEffect(() => {
    if (!isTimerActive) {
      lastTimeRef.current = null;
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    const tick = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      elapsedRef.current += delta;
      const currentProgress = Math.min(elapsedRef.current / autoSlideInterval, 1);
      setProgress(currentProgress);

      if (elapsedRef.current >= autoSlideInterval) {
        nextSlide();
        return;
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isTimerActive, autoSlideInterval, nextSlide, currentIndex]);

  // Handle Touch Swipe Gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    const threshold = 45;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartXRef.current = null;
  };

  if (total === 0) {
    return null;
  }

  // Single card: render clean image banner card without selector column
  if (total === 1) {
    const convention = conventions[0];
    const phase = getConventionPhase(convention);
    const phaseInfo = PHASE_CONFIG[phase];
    const location = [convention.venue_name, convention.city].filter(Boolean).join(', ');

    return (
      <div
        className={cn(
          'border-ink relative flex min-h-[360px] flex-col justify-between overflow-hidden border-2 bg-zinc-100 shadow-[4px_4px_0_var(--ink)] sm:min-h-[400px] dark:bg-zinc-950',
          className
        )}
      >
        {/* Convention Banner Backdrop */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
          {convention.banner || convention.banner_thumb ? (
            <>
              <img
                src={convention.banner || convention.banner_thumb || ''}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-2xl dark:opacity-30"
              />
              <img
                src={convention.banner || convention.banner_thumb || ''}
                alt=""
                className="relative h-full w-full object-contain"
              />
            </>
          ) : (
            <div className="h-full w-full bg-linear-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-950" />
          )}
        </div>

        {/* Content Area */}
        <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-between p-5 sm:p-7 md:p-8">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'border-ink font-display inline-flex items-center gap-1.5 border-2 px-2.5 py-1 text-xs uppercase shadow-[2px_2px_0_var(--ink)]',
                phaseInfo.chipClass
              )}
            >
              <Sparkles className="h-3 w-3 fill-current" />
              {phaseInfo.label}
            </span>
          </div>

          <div className="my-6 max-w-xl">
            <Link href={`/conventions/${convention.slug}`} className="group/link inline-block">
              <h3 className="font-display group-hover/link:text-accent-pop border-ink line-clamp-2 border-2 bg-white px-3.5 py-1.5 text-2xl font-bold tracking-wide text-zinc-950 uppercase shadow-[3px_3px_0_var(--ink)] transition-colors sm:text-3xl md:text-4xl dark:bg-zinc-950 dark:text-white">
                {convention.name}
                {phase !== 'past' && <span className="text-accent-pop ml-2">!</span>}
              </h3>
            </Link>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="text-accent border-ink flex items-center gap-2 border-2 bg-white px-2.5 py-1 text-xs font-semibold shadow-[2px_2px_0_var(--ink)] sm:text-sm dark:bg-zinc-950">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>{formatDateRange(convention.starts_at, convention.ends_at)}</span>
              </div>

              {location && (
                <div className="border-ink flex items-center gap-2 border-2 bg-white px-2.5 py-1 text-xs text-zinc-800 shadow-[2px_2px_0_var(--ink)] sm:text-sm dark:bg-zinc-950 dark:text-white">
                  <MapPin className="h-4 w-4 shrink-0 text-zinc-500 dark:text-white" />
                  <span className="truncate">{location}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <ConventionExternalLinks
                websiteUrl={convention.website_url}
                mapUrl={convention.map_url}
                variant="icon"
              />

              <Link
                href={`/conventions/${convention.slug}`}
                className={cn(
                  CONBLOCK,
                  'font-display bg-accent hover:bg-accent-pop inline-flex h-9 items-center gap-1.5 px-4 text-xs tracking-wider text-white uppercase transition-all dark:text-zinc-950 dark:hover:text-white'
                )}
              >
                <span>View Con</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const current = conventions[currentIndex];
  const phase = getConventionPhase(current);
  const phaseInfo = PHASE_CONFIG[phase];
  const location = [current.venue_name, current.city].filter(Boolean).join(', ');

  return (
    <div
      ref={containerRef}
      className={cn(
        'border-ink relative flex min-h-[400px] flex-col justify-between overflow-hidden border-2 bg-zinc-100 shadow-[4px_4px_0_var(--ink)] sm:min-h-[440px] md:min-h-[460px] dark:bg-zinc-950',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Featured Conventions"
    >
      {/* Convention Banner Backdrop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
        {current.banner || current.banner_thumb ? (
          <>
            <img
              key={`ambient-${current.id}`}
              src={current.banner || current.banner_thumb || ''}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-2xl transition-opacity duration-500 ease-out dark:opacity-30"
            />
            <img
              key={current.id}
              src={current.banner || current.banner_thumb || ''}
              alt=""
              className="relative h-full w-full object-contain transition-opacity duration-500 ease-out"
            />
          </>
        ) : (
          <div className="h-full w-full bg-linear-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-950" />
        )}
      </div>

      {/* Main Content Body */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-between gap-6 p-5 pb-4 sm:p-7 md:flex-row md:p-8 md:pb-4">
        {/* Left Spotlight Info Area */}
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          {/* Top Header Badge Row */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'border-ink font-display inline-flex items-center gap-1.5 border-2 px-2.5 py-1 text-xs uppercase shadow-[2px_2px_0_var(--ink)]',
                phaseInfo.chipClass
              )}
            >
              <Sparkles className="h-3 w-3 fill-current" />
              {phaseInfo.label}
            </span>
          </div>

          {/* Center Title, Date, and Venue */}
          <div className="my-6 max-w-xl">
            <Link href={`/conventions/${current.slug}`} className="group/link inline-block">
              <h3 className="font-display group-hover/link:text-accent-pop border-ink line-clamp-2 border-2 bg-white px-3.5 py-1.5 text-2xl font-bold tracking-wide text-zinc-950 uppercase shadow-[3px_3px_0_var(--ink)] transition-colors sm:text-3xl md:text-4xl dark:bg-zinc-950 dark:text-white">
                {current.name}
                {phase !== 'past' && <span className="text-accent-pop ml-2">!</span>}
              </h3>
            </Link>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="text-accent border-ink flex items-center gap-2 border-2 bg-white px-2.5 py-1 text-xs font-semibold shadow-[2px_2px_0_var(--ink)] sm:text-sm dark:bg-zinc-950">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>{formatDateRange(current.starts_at, current.ends_at)}</span>
              </div>

              {location && (
                <div className="border-ink flex items-center gap-2 border-2 bg-white px-2.5 py-1 text-xs text-zinc-800 shadow-[2px_2px_0_var(--ink)] sm:text-sm dark:bg-zinc-950 dark:text-white">
                  <MapPin className="h-4 w-4 shrink-0 text-zinc-500 dark:text-white" />
                  <span className="truncate">{location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Selector Column: Infinite cylindrical scroll with centered active convention */}
        <div className="flex w-full shrink-0 flex-col justify-start md:w-56 lg:w-60">
          {/* Compact Strip Selection Items with Dual Edge Fade Mask and Custom Scrollbar */}
          <div
            ref={listRef}
            style={maskStyle}
            className={cn(
              'flex max-h-[230px] flex-col gap-2 overflow-y-auto py-2 pr-3 pl-5',
              'scrollbar-thin [scrollbar-color:var(--color-accent)_transparent]',
              '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent',
              '[&::-webkit-scrollbar-thumb]:bg-zinc-400 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-600',
              '[&::-webkit-scrollbar-thumb]:border-ink [&::-webkit-scrollbar-thumb]:border',
              'hover:[&::-webkit-scrollbar-thumb]:bg-accent'
            )}
            role="tablist"
            aria-label="Featured conventions list"
          >
            {items.map((item) => {
              const isActive = item.originalIndex === currentIndex;
              return (
                <button
                  key={item.key}
                  ref={(el) => {
                    itemRefs.current[item.globalIndex] = el;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Select ${item.conv.name}`}
                  onClick={() => goToGlobalIndex(item.globalIndex, true)}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                  className={cn(
                    CONBLOCK,
                    'relative flex h-11 shrink-0 items-center gap-2 overflow-hidden p-1.5 text-left transition-all',
                    isActive
                      ? 'border-accent-pop bg-white text-zinc-950 shadow-[4px_4px_0_var(--ink)] hover:-translate-x-2.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--ink)] md:-translate-x-3 dark:bg-zinc-950 dark:text-white'
                      : 'hover:border-accent-pop bg-white text-zinc-800 hover:text-zinc-950 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:text-white'
                  )}
                >
                  {/* Thumbnail Image */}
                  <div className="border-ink relative h-7 w-7 shrink-0 overflow-hidden border bg-zinc-100 dark:bg-zinc-900">
                    {item.conv.banner_thumb || item.conv.banner ? (
                      <img
                        src={item.conv.banner_thumb || item.conv.banner || ''}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-zinc-200 dark:bg-zinc-800" />
                    )}
                    {isActive && <div className="bg-accent-pop/25 absolute inset-0" />}
                  </div>

                  {/* Convention Title */}
                  <span className="min-w-0 flex-1 truncate text-[11px] font-bold tracking-wide uppercase">
                    {item.conv.name}
                  </span>

                  {/* Progress bar on active strip */}
                  {isActive && (
                    <div className="absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-zinc-200 dark:bg-black">
                      <div
                        className={cn(
                          'bg-accent-pop h-full w-full origin-left transition-opacity duration-150',
                          !isTimerActive && 'opacity-70'
                        )}
                        style={{
                          transform: `scaleX(${progress})`,
                          willChange: 'transform',
                        }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Action Row: External Links, View Con, and Slider Controls */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 p-5 pt-0 sm:p-7 md:px-8 md:pb-8">
        {/* Left: Website, Location, and View Con */}
        <div className="flex flex-wrap items-center gap-2">
          <ConventionExternalLinks
            websiteUrl={current.website_url}
            mapUrl={current.map_url}
            variant="icon"
          />

          <Link
            href={`/conventions/${current.slug}`}
            className={cn(
              CONBLOCK,
              'font-display bg-accent hover:bg-accent-pop inline-flex h-9 items-center gap-1.5 px-4 text-xs tracking-wider text-white uppercase transition-all dark:text-zinc-950 dark:hover:text-white'
            )}
          >
            <span>View Con</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Right: Slider Action Controls (Play/Pause, Prev, Next) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsManuallyPaused((prev) => !prev)}
            title={isManuallyPaused ? 'Resume auto-advance' : 'Pause auto-advance'}
            aria-label={isManuallyPaused ? 'Resume auto-advance' : 'Pause auto-advance'}
            className="border-ink text-ink hover:border-accent-pop hover:text-accent-pop flex h-9 w-9 cursor-pointer items-center justify-center border-2 bg-white shadow-[1px_1px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-zinc-100 hover:shadow-none dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            {isManuallyPaused ? (
              <Play className="h-4 w-4 fill-current" />
            ) : (
              <Pause className="h-4 w-4 fill-current" />
            )}
          </button>

          <button
            type="button"
            onClick={prevSlide}
            title="Previous convention"
            aria-label="Previous convention"
            className="border-ink text-ink hover:border-accent-pop hover:text-accent-pop flex h-9 w-9 cursor-pointer items-center justify-center border-2 bg-white shadow-[1px_1px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-zinc-100 hover:shadow-none dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            title="Next convention"
            aria-label="Next convention"
            className="border-ink text-ink hover:border-accent-pop hover:text-accent-pop flex h-9 w-9 cursor-pointer items-center justify-center border-2 bg-white shadow-[1px_1px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-zinc-100 hover:shadow-none dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
