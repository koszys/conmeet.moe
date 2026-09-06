import { ArrowDown, Sparkles, Star } from 'lucide-react';
import { MikuSilhouette } from '@/shared/components/MikuSilhouette';
import { MikuTextVertical } from '@/shared/components/MikuTextVertical';
import { MikuTextHorizontal } from '@/shared/components/MikuTextHorizontal';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="halftone absolute inset-0" aria-hidden />
      <div aria-hidden className="scanlines pointer-events-none absolute inset-0 opacity-40" />

      {/* Desktop side graphics */}
      <MikuSilhouette className="text-accent pointer-events-none absolute top-1/2 right-12 hidden h-112 w-auto -translate-y-1/2 xl:block" />
      <MikuTextVertical className="text-accent-pop pointer-events-none absolute top-1/2 left-16 hidden h-96 w-auto -translate-y-1/2 xl:block" />

      {/* Mobile/Tablet watermark silhouette background framing */}
      <MikuSilhouette className="text-accent/15 dark:text-accent/20 pointer-events-none absolute top-1/2 -right-10 h-96 w-auto -translate-y-1/2 sm:-right-4 xl:hidden" />

      <Star
        aria-hidden
        className="fill-accent-pop text-accent-pop absolute top-16 left-[17%] h-6 w-6 -rotate-12"
      />
      <Sparkles
        aria-hidden
        className="text-accent absolute right-[12%] bottom-24 hidden h-7 w-7 rotate-12 md:block"
      />
      <Star
        aria-hidden
        className="text-accent absolute bottom-40 left-[16%] hidden h-4 w-4 rotate-45 md:block"
      />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pt-12 pb-14 text-center sm:pt-16 sm:pb-18 md:pt-24 md:pb-24">
        {/* Mobile/Tablet horizontal header graphic */}
        <div className="flex items-center gap-2 xl:hidden">
          <MikuTextHorizontal className="text-accent-pop h-10 w-auto sm:h-12" />
        </div>

        <h1 className="font-display mt-3 text-2xl leading-[1.2] tracking-wide sm:text-4xl md:text-5xl xl:text-6xl">
          conmeet<span className="text-accent">.moe</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-zinc-600 sm:mt-8 sm:text-lg dark:text-zinc-400">
          A community site for convention goers! Freebies, meetups, and schedules. Many more updates
          to come to make your con life easier.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-5 sm:mt-10 sm:flex-row">
          <a
            href="#conventions"
            className="border-ink bg-accent font-display inline-flex items-center gap-2 rounded-none border-2 px-7 py-4 text-xs tracking-wide text-white uppercase shadow-[4px_4px_0_var(--ink)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none sm:text-sm"
          >
            Check the line-up
            <ArrowDown className="h-4 w-4" />
          </a>
          <a
            href="#features"
            className="border-ink font-display text-ink hover:bg-accent-soft inline-flex items-center gap-2 rounded-none border-2 bg-white px-7 py-4 text-xs tracking-wide uppercase shadow-[4px_4px_0_var(--ink)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none sm:text-sm dark:bg-[#373b3e] dark:text-zinc-100"
          >
            How it works!
          </a>
        </div>
      </div>
    </section>
  );
}
