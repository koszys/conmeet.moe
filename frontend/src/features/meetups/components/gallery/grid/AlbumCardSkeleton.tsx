export function AlbumCardSkeleton() {
  return (
    <div className="border-ink animate-pulse border-2 bg-white shadow-[4px_4px_0_var(--ink)] dark:bg-zinc-900">
      {/* Preview Area Skeleton */}
      <div className="border-ink aspect-[16/10] w-full border-b-2 bg-zinc-200 dark:bg-zinc-800" />

      {/* Content */}
      <div className="p-3 sm:p-4">
        <div className="h-4.5 w-3/4 rounded bg-zinc-200 sm:h-5 dark:bg-zinc-800" />
        <div className="mt-2 h-3.5 w-full rounded bg-zinc-100 dark:bg-zinc-800/60" />
        <div className="mt-2.5 h-3 w-1/3 rounded bg-zinc-200 sm:mt-3 dark:bg-zinc-800" />
        <div className="mt-3 flex items-center gap-2 border-t border-zinc-200 pt-2.5 sm:mt-4 sm:pt-3 dark:border-zinc-800">
          <div className="h-7 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-8 w-8 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
