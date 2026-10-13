export function FreebieSkeleton({ withImage = false }: { withImage?: boolean }) {
  return (
    <div className="border-ink flex w-full animate-pulse flex-col justify-between border-2 bg-white shadow-[4px_4px_0_var(--ink)] dark:bg-zinc-900">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="border-ink h-6 w-6 border bg-zinc-100 dark:bg-zinc-800" />
        </div>
        <div className="mt-2.5 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-1.5 h-2.5 w-28 bg-zinc-200 dark:bg-zinc-800" />
          </div>
          {withImage ? (
            <div className="border-ink h-11 w-11 shrink-0 border-2 bg-zinc-200 shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-800" />
          ) : null}
        </div>
        <div className="border-ink mt-3 h-12 w-full border bg-zinc-50/80 p-2.5 shadow-[1px_1px_0_var(--ink)] dark:bg-zinc-800/60" />
        <div className="mt-2.5 space-y-1.5">
          <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-4/5 bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
      <div className="border-ink flex items-center gap-2 border-t-2 bg-zinc-50 p-2.5 sm:px-3.5 dark:bg-zinc-800/40">
        <div className="h-8 flex-1 bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-8 w-8 shrink-0 bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
