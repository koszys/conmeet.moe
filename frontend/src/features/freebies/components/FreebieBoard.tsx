'use client';

import { RotateCw } from 'lucide-react';
import { useConvention } from '@/features/conventions/data/api';
import { cn } from '@/shared/lib/utils';
import { useFreebieBoardState } from './board/useFreebieBoardState';
import { BoardHeader, BoardFilterBar, BoardAllTab, BoardSavedTab, BoardUploadedTab } from './board';
import { FreebieSkeleton } from './FreebieSkeleton';
import { FreebieDetailModal } from './FreebieDetailModal';
import { EditFreebieModal } from './EditFreebieModal';
import { DeleteFreebieModal } from './DeleteFreebieModal';

export function FreebieBoard({
  conventionSlug,
  conventionName,
}: {
  conventionSlug: string;
  conventionName?: string;
}) {
  const { data: convention } = useConvention(conventionSlug);
  const resolvedName = conventionName || convention?.name;
  const state = useFreebieBoardState(conventionSlug);

  return (
    <div className="@container space-y-6">
      <BoardHeader conventionSlug={conventionSlug} conventionName={resolvedName} />
      <BoardFilterBar state={state} />

      {state.isLoading ? (
        <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 xl:grid-cols-3 @min-[880px]:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <FreebieSkeleton key={i} withImage={i % 2 === 0} />
          ))}
        </div>
      ) : state.isError ? (
        <div className="border-ink border-2 border-dashed bg-rose-50 p-8 text-center dark:bg-rose-950/20">
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
            Failed to load freebies. Please refresh or check connection.
          </p>
          <button
            type="button"
            onClick={() => state.refreshBoard()}
            disabled={state.refreshStatus !== 'idle'}
            className="border-ink bg-accent mt-3 inline-flex cursor-pointer items-center gap-1.5 border-2 px-3 py-1.5 text-xs font-bold text-white uppercase shadow-[2px_2px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-950"
          >
            <RotateCw
              className={cn('h-3.5 w-3.5', state.refreshStatus === 'refreshing' && 'animate-spin')}
            />
            <span>{state.refreshStatus === 'refreshing' ? 'Syncing…' : 'Try Refreshing'}</span>
          </button>
        </div>
      ) : state.activeTab === 'all' ? (
        <BoardAllTab state={state} conventionSlug={conventionSlug} />
      ) : state.activeTab === 'uploaded' ? (
        <BoardUploadedTab state={state} conventionSlug={conventionSlug} />
      ) : (
        <BoardSavedTab state={state} />
      )}

      {state.selectedFreebie && (
        <FreebieDetailModal
          freebie={state.selectedFreebie}
          isOpen={Boolean(state.selectedFreebie)}
          onClose={() => state.setSelectedFreebieId(null)}
        />
      )}

      {state.editingFreebie && (
        <EditFreebieModal
          freebie={state.editingFreebie}
          isOpen={Boolean(state.editingFreebie)}
          onClose={() => state.setEditingFreebie(null)}
        />
      )}

      {state.deletingFreebie && (
        <DeleteFreebieModal
          freebie={state.deletingFreebie}
          isOpen={Boolean(state.deletingFreebie)}
          onClose={() => state.setDeletingFreebie(null)}
        />
      )}
    </div>
  );
}
