import Link from 'next/link';
import { MikuGif } from '@/shared/components/miku';
import { CONBLOCK, CONBLOCK_PRIMARY } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';

export default function NotFound() {
  return (
    <div className="flex min-h-[65vh] w-full flex-col items-center justify-center px-4 py-16 text-center">
      <div className="border-ink w-full max-w-md border-2 bg-white p-8 shadow-[6px_6px_0_var(--ink)] sm:p-12 dark:bg-zinc-900">
        <div className="mb-6 flex justify-center">
          <MikuGif size="lg" variant="framed" speech="404: Lost in the con!" speechPosition="top" />
        </div>

        <h1 className="font-display text-2xl font-bold tracking-wide uppercase sm:text-3xl">
          Page Not Found
        </h1>

        <p className="mt-3 text-xs leading-relaxed text-zinc-600 sm:text-sm dark:text-zinc-300">
          We couldn&apos;t locate the page you were looking for. The event might have moved or the
          link expired.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className={cn(
              CONBLOCK_PRIMARY,
              'px-5 py-2.5 text-xs font-bold tracking-wider uppercase'
            )}
          >
            Back to Home
          </Link>
          <Link
            href="/conventions"
            className={cn(
              CONBLOCK,
              'bg-zinc-100 px-5 py-2.5 text-xs font-bold tracking-wider uppercase hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700'
            )}
          >
            All Conventions
          </Link>
        </div>
      </div>
    </div>
  );
}
