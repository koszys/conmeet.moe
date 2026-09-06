import Link from 'next/link';
import { Mail } from 'lucide-react';

export function ConventionRequest() {
  return (
    <div className="border-ink bg-accent-soft/50 mt-14 border-2 p-6 shadow-[4px_4px_0_var(--ink)] md:p-8 dark:bg-zinc-900">
      <h3 className="font-display text-lg tracking-wide uppercase sm:text-xl">
        don&apos;t see your con?
      </h3>
      <p className="mt-3 max-w-2xl leading-relaxed text-zinc-700 dark:text-zinc-300">
        This site only lists conventions that are currently on the platform — it&apos;s not every
        convention out there. You can submit a request to add a convention, and each request is
        manually reviewed. Thank you!
      </p>

      <div className="mt-5 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <span className="font-display border-ink text-ink inline-flex items-center gap-2 rounded-none border-2 bg-white px-5 py-2.5 text-xs tracking-wide uppercase dark:bg-zinc-900 dark:text-zinc-100">
          <Mail className="text-accent-pop h-4 w-4" />
          Submit a request
        </span>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Check out{' '}
          <Link
            href="https://fancons.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-pop font-semibold underline decoration-dotted underline-offset-4 transition-colors"
          >
            FanCons.com
          </Link>{' '}
          for a list of conventions.
        </p>
      </div>
    </div>
  );
}
