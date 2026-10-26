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

  // Mobile swipe and gesture animations
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev' | null>(null);
  const [isWiggling, setIsWiggling] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
  const hasPlayedWiggleRef = useRef(false);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const total = conventions.length;
  const isInfinite = total >= 3;

  // 5-Slot Virtual Wheel
  const virtualSlots = useMemo(() => {
    if (!isInfinite) {
      return conventions.map((conv, idx) => ({
        conv,
        originalIndex: idx,
        slotOffset: idx - currentIndex,
        isActive: idx === currentIndex,
        key: `static-${conv.id}`,
      }));
    }

    const offsets = [-2, -1, 0, 1, 2];
    return offsets.map((slotOffset) => {
      const mappedIndex = (currentIndex + slotOffset + total * 100) % total;
      return {
        conv: conventions[mappedIndex],
        originalIndex: mappedIndex,
        slotOffset,
        isActive: slotOffset === 0,
        key: `slot-${slotOffset}-${conventions[mappedIndex].id}`,
      };
    });
  }, [conventions, currentIndex, isInfinite, total]);

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setSlideDirection('next');
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setSlideDirection('prev');
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Click on any visible slot: smoothly rotates that slot to center
  const handleSlotClick = useCallback((slot: { originalIndex: number; slotOffset: number }) => {
    if (slot.slotOffset === 0) return;
    if (slot.slotOffset > 0) {
      setSlideDirection('next');
    } else {
      setSlideDirection('prev');
    }
    setCurrentIndex(slot.originalIndex);
  }, []);

  // Mouse wheel / trackpad scroll over the selector
  const wheelAccumulatorRef = useRef(0);
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAdvanceTimeRef = useRef(0);

  useEffect(() => {
    const list = listRef.current;
    if (!list || !isInfinite) return;

    const onWheel = (e: WheelEvent) => {
      // Prevent the outer webpage from scrolling while rotating the selector
      e.preventDefault();

      const now = Date.now();
      wheelAccumulatorRef.current += e.deltaY;

      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }

      const threshold = 35;
      const cooldown = 180; // ms minimum between notch clicks to avoid skipping

      if (now - lastAdvanceTimeRef.current > cooldown) {
        if (wheelAccumulatorRef.current > threshold) {
          nextSlide();
          wheelAccumulatorRef.current = 0;
          lastAdvanceTimeRef.current = now;
        } else if (wheelAccumulatorRef.current < -threshold) {
          prevSlide();
          wheelAccumulatorRef.current = 0;
          lastAdvanceTimeRef.current = now;
        }
      }

      wheelTimeoutRef.current = setTimeout(() => {
        wheelAccumulatorRef.current = 0;
      }, 150);
    };

    // Attach non-passive event listener so e.preventDefault() blocks window scrolling
    list.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      list.removeEventListener('wheel', onWheel);
      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
    };
  }, [isInfinite, nextSlide, prevSlide]);

  // Dual edge fade mask: only fades outer peeks (0-48px top and bottom), leaving all 3 cards 100% solid
  const maskStyle = useMemo<React.CSSProperties | undefined>(() => {
    if (!isInfinite) return undefined;
    return {
      maskImage:
        'linear-gradient(to bottom, transparent 0px, black 48px, black calc(100% - 48px), transparent 100%)',
      WebkitMaskImage:
        'linear-gradient(to bottom, transparent 0px, black 48px, black calc(100% - 48px), transparent 100%)',
    };
  }, [isInfinite]);

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

  // One-time micro-wiggle gesture hint when card enters view on mobile
  useEffect(() => {
    if (
      total <= 1 ||
      !isInView ||
      hasPlayedWiggleRef.current ||
      typeof window === 'undefined' ||
      window.innerWidth >= 768
    ) {
      return;
    }

    const timer = setTimeout(() => {
      setIsWiggling(true);
      hasPlayedWiggleRef.current = true;

      const stopTimer = setTimeout(() => {
        setIsWiggling(false);
      }, 850);

      return () => clearTimeout(stopTimer);
    }, 450);

    return () => clearTimeout(timer);
  }, [isInView, total]);

  // Handle Touch Swipe Gestures with real-time drag tracking
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isWiggling) setIsWiggling(false);
    hasPlayedWiggleRef.current = true;

    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    isHorizontalSwipeRef.current = null;
    setIsDragging(true);
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartXRef.current;
    const diffY = currentY - touchStartYRef.current;

    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(diffX) > 6 || Math.abs(diffY) > 6) {
        isHorizontalSwipeRef.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    if (isHorizontalSwipeRef.current) {
      setDragOffset(diffX * 0.8);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null) return;
    setIsDragging(false);
    setIsPaused(false);

    const threshold = 45;
    if (dragOffset < -threshold) {
      setSlideDirection('next');
      nextSlide();
    } else if (dragOffset > threshold) {
      setSlideDirection('prev');
      prevSlide();
    }

    setDragOffset(0);
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    isHorizontalSwipeRef.current = null;
  };

  const slideAnimationClass =
    !isDragging && !isWiggling
      ? slideDirection === 'next'
        ? 'animate-slide-in-right md:animate-none'
        : slideDirection === 'prev'
          ? 'animate-slide-in-left md:animate-none'
          : ''
      : '';

  const slideTransformStyle: React.CSSProperties | undefined = isDragging
    ? {
        transform: `translateX(${dragOffset}px)`,
        transition: 'none',
      }
    : isWiggling
      ? {
          animation: 'mobile-swipe-wiggle 850ms cubic-bezier(0.25, 1, 0.5, 1)',
        }
      : undefined;

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
                <div className="border-ink flex max-w-full items-start gap-2 border-2 bg-white px-2.5 py-1 text-xs text-zinc-800 shadow-[2px_2px_0_var(--ink)] sm:items-center sm:text-sm dark:bg-zinc-950 dark:text-white">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500 sm:mt-0 dark:text-white" />
                  <span className="line-clamp-2 break-words sm:line-clamp-1">{location}</span>
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
        'border-ink relative flex min-h-[360px] flex-col justify-between overflow-hidden border-2 bg-zinc-100 shadow-[4px_4px_0_var(--ink)] sm:min-h-[400px] md:min-h-[460px] dark:bg-zinc-950',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Featured Conventions"
    >
      {/* Mobile Swipe Hint Badge: Briefly displays during micro-wiggle on initial view */}
      {isWiggling && (
        <div className="border-ink bg-accent-pop pointer-events-none absolute top-4 right-4 z-30 flex items-center gap-1.5 border-2 px-2.5 py-1 text-xs font-bold tracking-wider text-white uppercase shadow-[2px_2px_0_var(--ink)] md:hidden">
          <ChevronLeft className="h-3.5 w-3.5 animate-pulse" />
          <span>Swipe</span>
          <ChevronRight className="h-3.5 w-3.5 animate-pulse" />
        </div>
      )}

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
            <div
              key={`banner-fg-${current.id}`}
              className={cn('relative h-full w-full', slideAnimationClass)}
              style={slideTransformStyle}
            >
              <img
                src={current.banner || current.banner_thumb || ''}
                alt=""
                className="h-full w-full object-contain transition-opacity duration-500 ease-out"
              />
            </div>
          </>
        ) : (
          <div className="h-full w-full bg-linear-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-950" />
        )}
      </div>

      {/* Main Content Body */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-between gap-6 p-5 pb-4 sm:p-7 md:flex-row md:p-8 md:pb-4">
        {/* Left Spotlight Info Area */}
        <div
          key={`info-${current.id}`}
          className={cn('flex min-w-0 flex-1 flex-col justify-between', slideAnimationClass)}
          style={slideTransformStyle}
        >
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
                <div className="border-ink flex max-w-full items-start gap-2 border-2 bg-white px-2.5 py-1 text-xs text-zinc-800 shadow-[2px_2px_0_var(--ink)] sm:items-center sm:text-sm dark:bg-zinc-950 dark:text-white">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500 sm:mt-0 dark:text-white" />
                  <span className="line-clamp-2 break-words sm:line-clamp-1">{location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Selector Column: Hidden on mobile (< md) to avoid clutter, visible on desktop (md+) */}
        <div className="hidden shrink-0 flex-col justify-center md:flex md:w-56 md:self-center lg:w-60">
          {/* Compact Strip Selection Items (5-Slot Virtual Wheel with zero duplicate copies) */}
          <div
            ref={listRef}
            style={maskStyle}
            className={cn(
              'relative flex flex-col justify-center gap-2 overscroll-contain py-1 pr-3 pl-5',
              isInfinite ? 'h-[250px] overflow-hidden' : 'overflow-visible'
            )}
            role="tablist"
            aria-label="Featured conventions list"
          >
            {virtualSlots.map((slot) => {
              const isActive = slot.isActive;
              return (
                <button
                  key={slot.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Select ${slot.conv.name}`}
                  onClick={() => handleSlotClick(slot)}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                  className={cn(
                    CONBLOCK,
                    'relative flex h-11 shrink-0 items-center gap-2 overflow-hidden p-1.5 text-left transition-all duration-200',
                    isActive
                      ? 'border-accent-pop bg-white text-zinc-950 shadow-[4px_4px_0_var(--ink)] hover:-translate-x-2.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--ink)] md:-translate-x-3 dark:bg-zinc-950 dark:text-white'
                      : 'hover:border-accent-pop bg-white text-zinc-800 hover:text-zinc-950 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:text-white',
                    Math.abs(slot.slotOffset) === 2 && 'opacity-40 hover:opacity-80'
                  )}
                >
                  {/* Thumbnail Image */}
                  <div className="border-ink relative h-7 w-7 shrink-0 overflow-hidden border bg-zinc-100 dark:bg-zinc-900">
                    {slot.conv.banner_thumb || slot.conv.banner ? (
                      <img
                        src={slot.conv.banner_thumb || slot.conv.banner || ''}
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
                    {slot.conv.name}
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

        {/* Right: Slider Action Controls (Play/Pause, Prev, Next) + Mobile Counter */}
        <div className="flex items-center gap-2">
          {/* Mobile-Only Slide Counter Badge */}
          {total > 1 && (
            <div className="border-ink font-display flex h-9 items-center justify-center border-2 bg-white px-2.5 text-xs font-bold tracking-wider text-zinc-950 shadow-[1px_1px_0_var(--ink)] md:hidden dark:bg-zinc-900 dark:text-zinc-100">
              <span className="text-accent-pop">{String(currentIndex + 1).padStart(2, '0')}</span>
              <span className="mx-1 text-zinc-400 dark:text-zinc-600">/</span>
              <span>{String(total).padStart(2, '0')}</span>
            </div>
          )}

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

      {/* Mobile-Only Bottom Countdown Progress Bar (replaces the progress bar on the hidden desktop strip) */}
      {total > 1 && (
        <div className="absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-zinc-200 md:hidden dark:bg-black">
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
    </div>
  );
}
