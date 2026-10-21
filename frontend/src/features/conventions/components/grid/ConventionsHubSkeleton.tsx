export function CardSkeleton() {
  return (
    <div className="border-ink relative flex min-h-60 animate-pulse flex-col justify-between overflow-hidden border-2 bg-zinc-100 shadow-[4px_4px_0_var(--ink)] sm:min-h-64 md:min-h-72 dark:bg-zinc-900">
      <div className="space-y-4 p-5 sm:p-6 md:p-8">
        <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-8 w-2/3 bg-zinc-200 sm:w-1/2 dark:bg-zinc-800" />
        <div className="space-y-2 pt-2">
          <div className="h-4 w-1/3 bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-1/4 bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
      <div className="border-ink flex items-center justify-between border-t-2 border-dashed px-5 py-3.5 sm:px-6 md:px-8">
        <div className="h-7 w-20 bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-7 w-24 bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="border-ink flex animate-pulse items-center gap-4 border-b-2 border-dashed px-2 py-6 md:px-4">
      <div className="border-ink h-14 w-14 bg-zinc-200 dark:bg-zinc-800" />
      <div className="flex-1 space-y-2.5">
        <div className="h-4 w-1/3 bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-1/4 bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

export interface ConventionsHubSkeletonProps {
  view: 'featured' | 'list';
}

export function ConventionsHubSkeleton({ view }: ConventionsHubSkeletonProps) {
  return (
    <div className="mt-8">
      {view === 'featured' ? (
        <div className="flex flex-col gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div>
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
        </div>
      )}
    </div>
  );
}
