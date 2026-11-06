export function MeetupDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      {/* Backlink skeleton */}
      <div className="h-4 w-32 animate-pulse bg-zinc-200 dark:bg-zinc-800" />

      {/* Main card skeleton */}
      <div className="border-ink border-2 bg-white shadow-[6px_6px_0_var(--ink)] dark:bg-zinc-900">
        <div className="border-ink aspect-[21/9] w-full animate-pulse border-b-2 bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-4 p-6 sm:p-8">
          <div className="h-4 w-24 animate-pulse bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-8 w-3/4 animate-pulse bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex gap-4">
            <div className="h-5 w-40 animate-pulse bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-5 w-32 animate-pulse bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="flex gap-3 pt-4">
            <div className="h-10 w-36 animate-pulse bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-10 w-32 animate-pulse bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
