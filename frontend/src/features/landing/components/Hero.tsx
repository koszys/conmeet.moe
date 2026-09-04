import { ArrowDown, Sparkles, Star } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="halftone absolute inset-0" aria-hidden />

      <Star
        aria-hidden
        className="fill-accent-pop text-accent-pop absolute top-16 left-[8%] h-6 w-6 -rotate-12"
      />
      <Sparkles
        aria-hidden
        className="text-accent absolute right-[12%] bottom-24 hidden h-7 w-7 rotate-12 md:block"
      />
      <Star
        aria-hidden
        className="text-accent absolute bottom-40 left-[16%] hidden h-4 w-4 rotate-45 md:block"
      />

      <div className="relative mx-auto max-w-4xl px-4 pt-20 pb-20 text-center md:pt-28 md:pb-28">
        <h1 className="font-display mt-8 text-5xl leading-[1.05] tracking-wide sm:text-7xl">
          conmeet<span className="text-accent">.moe</span>
        </h1>

        <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-400">
          A community site for convention goers! Freebies, meetups, and schedules. Many more updates
          to come to make your con life easier.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row">
          <a
            href="#conventions"
            className="border-ink bg-accent inline-flex items-center gap-2 rounded-md border-2 px-7 py-3.5 text-sm font-bold tracking-widest text-white uppercase shadow-[4px_4px_0_var(--ink)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            Check the line-up
            <ArrowDown className="h-4 w-4" />
          </a>
          <a
            href="#features"
            className="border-ink text-ink hover:bg-accent-soft inline-flex items-center gap-2 rounded-md border-2 bg-white px-7 py-3.5 text-sm font-bold tracking-widest uppercase shadow-[4px_4px_0_var(--ink)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none dark:bg-[#0c0c0e] dark:text-zinc-100"
          >
            How it works!
          </a>
        </div>
      </div>
    </section>
  );
}
