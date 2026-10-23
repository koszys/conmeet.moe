'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { ConventionCard } from './ConventionCard';
import type { Convention } from '../../types';
import { CONBLOCK } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export interface FeaturedConventionSliderProps {
  conventions: Convention[];
  className?: string;
  autoSlideInterval?: number;
}

export function FeaturedConventionSlider({
  conventions,
  className,
  autoSlideInterval = 10000,
}: FeaturedConventionSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);

  const total = conventions.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

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

  // 10-Second Auto-Slide Timer
  useEffect(() => {
    if (total <= 1 || !isInView || isPaused || isManuallyPaused) {
      return;
    }

    const timer = setTimeout(() => {
      nextSlide();
    }, autoSlideInterval);

    return () => clearTimeout(timer);
  }, [currentIndex, isInView, isPaused, isManuallyPaused, total, autoSlideInterval, nextSlide]);

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

  // Single card: render directly without slider controls
  if (total === 1) {
    return (
      <div className={className}>
        <ConventionCard convention={conventions[0]} />
      </div>
    );
  }

  const isTimerActive = isInView && !isPaused && !isManuallyPaused;

  return (
    <div
      ref={containerRef}
      className={cn('relative flex flex-col gap-4', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured Conventions"
    >
      {/* 10-Second Countdown Progress Bar */}
      <div className="border-ink relative h-1.5 w-full overflow-hidden border-2 bg-zinc-100 shadow-[1px_1px_0_var(--ink)] dark:bg-zinc-800">
        <div
          key={`${currentIndex}-${isTimerActive}`}
          className={cn(
            'bg-accent h-full w-full origin-left',
            isTimerActive ? 'animate-progress-timer' : 'opacity-40'
          )}
          style={{
            animationDuration: `${autoSlideInterval}ms`,
            animationPlayState: isTimerActive ? 'running' : 'paused',
          }}
        />
      </div>

      {/* Slide Container (Touch enabled) */}
      <div className="overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {conventions.map((convention, index) => (
            <div
              key={convention.id}
              className="w-full shrink-0"
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${total}: ${convention.name}`}
              aria-hidden={index !== currentIndex}
            >
              <ConventionCard convention={convention} />
            </div>
          ))}
        </div>
      </div>

      {/* Slider Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Slide Counter & Indicators */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold tracking-wider text-zinc-600 dark:text-zinc-400">
            {String(currentIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>

          {/* Dot Pills */}
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Slides">
            {conventions.map((conv, idx) => (
              <button
                key={conv.id}
                type="button"
                role="tab"
                aria-selected={idx === currentIndex}
                aria-label={`Go to slide ${idx + 1}: ${conv.name}`}
                onClick={() => goToSlide(idx)}
                className={cn(
                  'border-ink h-2.5 transition-all',
                  idx === currentIndex
                    ? 'bg-accent w-6 border-2 shadow-[1px_1px_0_var(--ink)]'
                    : 'w-2.5 border bg-white hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700'
                )}
              />
            ))}
          </div>
        </div>

        {/* Action Controls (Pause/Play & Prev/Next) */}
        <div className="flex items-center gap-2">
          {/* Pause / Play Toggle */}
          <button
            type="button"
            onClick={() => setIsManuallyPaused((prev) => !prev)}
            title={isManuallyPaused ? 'Resume auto-slide' : 'Pause auto-slide'}
            aria-label={isManuallyPaused ? 'Resume auto-slide' : 'Pause auto-slide'}
            className={cn(
              CONBLOCK,
              'inline-flex h-8 w-8 cursor-pointer items-center justify-center p-0 text-zinc-800 hover:bg-zinc-100 hover:text-black dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800'
            )}
          >
            {isManuallyPaused ? (
              <Play className="h-3.5 w-3.5 fill-current" />
            ) : (
              <Pause className="h-3.5 w-3.5 fill-current" />
            )}
          </button>

          {/* Previous Button */}
          <button
            type="button"
            onClick={prevSlide}
            title="Previous convention"
            aria-label="Previous convention"
            className={cn(
              CONBLOCK,
              'inline-flex h-8 w-8 cursor-pointer items-center justify-center p-0 text-zinc-800 hover:bg-zinc-100 hover:text-black dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Next Button */}
          <button
            type="button"
            onClick={nextSlide}
            title="Next convention"
            aria-label="Next convention"
            className={cn(
              CONBLOCK,
              'inline-flex h-8 w-8 cursor-pointer items-center justify-center p-0 text-zinc-800 hover:bg-zinc-100 hover:text-black dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800'
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
