import Link from 'next/link';
import { Mail } from 'lucide-react';

export function ConventionRequest() {
  return (
    <div className="border-ink bg-accent-soft/50 mt-14 border-2 p-4 shadow-[4px_4px_0_var(--ink)] sm:p-6 md:p-8 dark:bg-zinc-900">
      <h3 className="font-display text-lg tracking-wide uppercase sm:text-xl">
        don&apos;t see your con?
      </h3>
      <p className="mt-3 max-w-2xl leading-relaxed text-zinc-700 dark:text-zinc-300">
        This site only lists conventions that are currently on the platform. You can submit a
        request to add a convention, and each request is manually reviewed. Thank you!
      </p>

      <div className="mt-5 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Link
          href="/conventions/request"
          className="font-display border-ink text-ink hover:border-accent-pop hover:text-accent-pop dark:hover:border-accent-pop dark:hover:text-accent-pop inline-flex items-center gap-2 rounded-none border-2 bg-white px-3.5 py-2 text-[10px] tracking-wide uppercase shadow-[3px_3px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_var(--ink)] active:translate-x-1 active:translate-y-1 active:shadow-none min-[380px]:px-5 min-[380px]:py-2.5 min-[380px]:text-xs dark:bg-zinc-900 dark:text-zinc-100"
        >
          <Mail className="text-accent-pop h-4 w-4" />
          Submit a request
        </Link>
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
