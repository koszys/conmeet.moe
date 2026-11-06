'use client';

export function MeetupSkeleton() {
  return (
    <div className="border-ink flex animate-pulse flex-col border-2 bg-white shadow-[4px_4px_0_var(--ink)] dark:bg-zinc-900">
      <div className="border-ink aspect-[16/9] w-full border-b-2 bg-zinc-200 dark:bg-zinc-800" />
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="h-4 w-1/3 bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-2.5 h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-2 h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-3 h-3 w-1/3 bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-5 flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-zinc-800">
          <div className="h-7 w-20 bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
