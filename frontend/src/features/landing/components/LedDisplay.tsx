'use client';

import { useEffect, useRef } from 'react';
import { Star } from 'lucide-react';

const ITEMS = ['FREEBIES', 'MEETUPS', 'SCHEDULES', 'COMMUNITY', 'HAVE FUN'];
const SCROLL_SPEED = 60; // px per second
const EQ_BARS = [7, 5, 3, 6];
const COPIES = 6;

export function LedDisplay() {
  const trackRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const measure = () => {
      widthRef.current = Math.floor(track.scrollWidth / COPIES);
    };
    measure();

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frameId: number | null = null;
    let mounted = true;
    let x = 0;
    let last = performance.now();

    const reflow = () => {
      const previousWidth = widthRef.current;
      measure();
      if (widthRef.current > 0) {
        x = ((x % widthRef.current) + widthRef.current) % widthRef.current;
        if (previousWidth === 0) {
          x = 0;
        }
      }
    };

    const tick = (now: number) => {
      if (!mounted) {
        return;
      }
      const dt = (now - last) / 1000;
      last = now;
      x += SCROLL_SPEED * dt;
      if (widthRef.current > 0 && x >= widthRef.current) {
        x -= widthRef.current;
      }
      track.style.transform = `translate3d(${-x}px, 0, 0)`;
      frameId = requestAnimationFrame(tick);
    };

    if (!reduced.matches) {
      frameId = requestAnimationFrame(tick);
    }

    const observer = new ResizeObserver(reflow);
    observer.observe(track);

    return () => {
      mounted = false;
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <section
      aria-label="Site highlights ticker"
      className="border-ink bg-accent-soft border-y-2 dark:bg-[#164e63]/40"
    >
      <div className="mx-auto max-w-6xl px-4 py-5 md:px-6">
        <div className="border-ink rounded-[6px] border-2 bg-[#0a0a0c] p-4 shadow-[4px_4px_0_var(--ink)] ring-1 ring-white/5 dark:ring-white/10">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-display text-[10px] tracking-widest text-zinc-500">
              ▮ CONMEET.MOE
            </span>
            <span className="flex items-center gap-3">
              <span className="font-display text-[10px] tracking-widest text-zinc-600">
                #LINE-UP
              </span>
              <span aria-hidden className="flex h-3 items-end gap-1">
                {EQ_BARS.map((height, index) => (
                  <span
                    key={index}
                    className="bg-accent animate-eq w-1 origin-bottom"
                    style={{ height, animationDelay: `${index * 0.14}s` }}
                  />
                ))}
              </span>
            </span>
          </div>

          <div className="relative flex h-10 items-center overflow-hidden sm:h-12">
            <div
              ref={trackRef}
              aria-hidden
              className="flex w-max items-center whitespace-nowrap will-change-transform"
            >
              {[...Array(COPIES)]
                .flatMap(() => ITEMS)
                .map((item, index) => (
                  <span
                    key={index}
                    className="font-display text-accent flex items-center gap-4 pr-6 text-sm tracking-wide uppercase"
                  >
                    {item}
                    <Star className="fill-accent-pop text-accent-pop h-3 w-3 shrink-0" />
                  </span>
                ))}
            </div>
            <span className="sr-only">{ITEMS.join(', ')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
