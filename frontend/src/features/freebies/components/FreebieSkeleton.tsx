export function FreebieSkeleton() {
  return (
    <div className="border-ink flex animate-pulse flex-col justify-between border-2 bg-white p-5 shadow-[4px_4px_0_var(--ink)] dark:bg-zinc-900">
      <div>
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="mt-4 h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-3 h-12 w-full bg-zinc-100 dark:bg-zinc-800/60" />
        <div className="mt-3 space-y-1.5">
          <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-4/5 bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
      <div className="mt-6 flex items-center gap-3 border-t-2 border-zinc-100 pt-3 dark:border-zinc-800">
        <div className="h-9 flex-1 bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-9 w-16 bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
