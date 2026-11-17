export function AlbumCardSkeleton() {
  return (
    <div className="border-ink animate-pulse border-2 bg-white shadow-[4px_4px_0_var(--ink)] dark:bg-zinc-900">
      {/* Preview Area Skeleton */}
      <div className="border-ink aspect-[16/10] w-full border-b-2 bg-zinc-200 dark:bg-zinc-800" />

      {/* Content Area Skeleton */}
      <div className="p-4">
        {/* Title skeleton */}
        <div className="h-5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />

        {/* Description line skeleton */}
        <div className="mt-2 h-3.5 w-full rounded bg-zinc-100 dark:bg-zinc-800/60" />

        {/* Creator skeleton */}
        <div className="mt-3 h-3 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />

        {/* Action footer skeleton */}
        <div className="mt-4 flex items-center gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
          <div className="h-7 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-8 w-8 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
