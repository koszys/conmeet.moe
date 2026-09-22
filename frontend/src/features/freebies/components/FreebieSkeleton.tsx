export function FreebieSkeleton({ withImage = false }: { withImage?: boolean }) {
  return (
    <div className="border-ink mb-6 flex w-full animate-pulse break-inside-avoid flex-col justify-between border-2 bg-white shadow-[4px_4px_0_var(--ink)] dark:bg-zinc-900">
      {withImage ? (
        <div className="border-ink aspect-video w-full border-b-2 bg-zinc-200 dark:bg-zinc-800" />
      ) : null}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="mt-3 h-5 w-3/4 bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-3 h-14 w-full bg-zinc-100 dark:bg-zinc-800/60" />
        <div className="mt-3 space-y-1.5">
          <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-4/5 bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
      <div className="border-ink flex items-center gap-2.5 border-t-2 bg-zinc-50 p-3 sm:gap-3 sm:px-4 dark:bg-zinc-800/40">
        <div className="h-10 flex-1 bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-10 w-20 bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
