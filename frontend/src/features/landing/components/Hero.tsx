import { ArrowRight, Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <section className="mx-auto max-w-3xl px-4 pt-20 pb-16 text-center md:pt-28 md:pb-24">
      <span className="border-accent-soft bg-accent-soft text-accent inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold">
        <Sparkles className="h-3.5 w-3.5" />
        Crowdsourced by the community
      </span>

      <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900 sm:text-6xl dark:text-zinc-50">
        Never miss a freebie, meetup, or event again.
      </h1>

      <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
        conmeet helps convention goers track freebies, plan meetups, and build a personal schedule
        across every convention they attend.
      </p>

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          href="#conventions"
          className="bg-accent hover:bg-accent-hover inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors"
        >
          Browse Conventions
          <ArrowRight className="h-4 w-4" />
        </a>
        <a
          href="#features"
          className="hover:border-accent hover:text-accent dark:hover:border-accent dark:hover:text-accent inline-flex items-center rounded-lg border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors dark:border-zinc-700 dark:text-zinc-200"
        >
          See what it does
        </a>
      </div>
    </section>
  );
}
