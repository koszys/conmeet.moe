'use client';

import { useFreebieBoardState } from './board/useFreebieBoardState';
import { BoardHeader, BoardFilterBar, BoardAllTab, BoardSavedTab, BoardUploadedTab } from './board';
import { FreebieSkeleton } from './FreebieSkeleton';

export function FreebieBoard({
  conventionSlug,
  conventionName,
}: {
  conventionSlug: string;
  conventionName?: string;
}) {
  const state = useFreebieBoardState(conventionSlug);

  return (
    <div className="space-y-6">
      <BoardHeader conventionSlug={conventionSlug} conventionName={conventionName} />
      <BoardFilterBar state={state} />

      {state.isLoading ? (
        <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <FreebieSkeleton key={i} withImage={i % 2 === 0} />
          ))}
        </div>
      ) : state.isError ? (
        <div className="border-ink border-2 border-dashed bg-rose-50 p-8 text-center dark:bg-rose-950/20">
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
            Failed to load freebies. Please refresh or check connection.
          </p>
        </div>
      ) : state.activeTab === 'all' ? (
        <BoardAllTab state={state} conventionSlug={conventionSlug} />
      ) : state.activeTab === 'uploaded' ? (
        <BoardUploadedTab state={state} conventionSlug={conventionSlug} />
      ) : (
        <BoardSavedTab state={state} />
      )}
    </div>
  );
}
