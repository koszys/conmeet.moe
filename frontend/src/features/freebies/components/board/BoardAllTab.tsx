'use client';

import { Bookmark } from 'lucide-react';
import { FreebieCard } from '../FreebieCard';
import { FreebieEmptyState } from './FreebieEmptyState';
import type { FreebieBoardState } from './types';

interface BoardAllTabProps {
  state: FreebieBoardState;
  conventionSlug: string;
}

export function BoardAllTab({ state, conventionSlug }: BoardAllTabProps) {
  const {
    allDrops,
    unsavedDrops,
    savedDrops,
    isFiltered,
    handleClearFilters,
    isCardCondensed,
    handleToggleCardCondensed,
    handleToggleAllCondensed,
  } = state;

  if (allDrops.length === 0) {
    return (
      <FreebieEmptyState
        tab="all"
        isFiltered={isFiltered}
        onClearFilters={handleClearFilters}
        conventionSlug={conventionSlug}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Unsaved drops (Top) */}
      <section>
        <div className="border-ink flex items-center justify-between border-b-2 border-dashed pb-3">
          <div className="flex items-center gap-2.5">
            <h2 className="font-display text-sm tracking-widest uppercase sm:text-base">
              Available to Claim
            </h2>
            <span className="border-ink/20 border bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {unsavedDrops.length}
            </span>
          </div>

          {unsavedDrops.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                Compact
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={allDrops.some((d) => isCardCondensed(d.id))}
                onClick={handleToggleAllCondensed}
                className="cursor-pointer text-xs font-bold text-zinc-500 underline decoration-zinc-400 underline-offset-4 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {allDrops.some((d) => isCardCondensed(d.id)) ? 'Expand' : 'Collapse'}
              </button>
            </div>
          )}
        </div>

        {unsavedDrops.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 items-start gap-5 sm:grid-cols-2 xl:grid-cols-3 @min-[880px]:grid-cols-3">
            {unsavedDrops.map((freebie) => (
              <FreebieCard
                key={freebie.id}
                freebie={freebie}
                condensed={isCardCondensed(freebie.id)}
                onToggleCondensed={() => handleToggleCardCondensed(freebie.id)}
                onOpenDetail={() => state.setSelectedFreebieId(freebie.id)}
                onEdit={(f) => state.setEditingFreebie(f)}
                onDelete={(f) => state.setDeletingFreebie(f)}
              />
            ))}
          </div>
        ) : (
          <div className="border-ink mt-5 border-2 border-dashed bg-zinc-50/70 p-6 text-center dark:bg-zinc-900/50">
            <div className="border-ink mx-auto flex h-9 w-9 items-center justify-center border-2 bg-zinc-100 text-zinc-400 shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-800 dark:text-zinc-500">
              <Bookmark className="h-4 w-4" />
            </div>
            <p className="mt-2 text-xs font-bold text-zinc-700 uppercase dark:text-zinc-200">
              All Available Drops Claimed
            </p>
            <p className="mx-auto mt-1 max-w-sm text-[11px] text-zinc-500 dark:text-zinc-400">
              You&apos;ve added every available drop on the board to your saved checklist!
            </p>
          </div>
        )}
      </section>

      {/* Saved drops (Bottom) */}
      {savedDrops.length > 0 && (
        <section className="border-ink/40 border-t-2 border-dashed pt-6">
          <div className="flex items-center gap-2.5 pb-4">
            <h2 className="font-display text-sm tracking-widest text-zinc-600 uppercase sm:text-base dark:text-zinc-400">
              Saved to Your List
            </h2>
            <span className="border-ink/20 border bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {savedDrops.length}
            </span>
          </div>

          <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 xl:grid-cols-3 @min-[880px]:grid-cols-3">
            {savedDrops.map((freebie) => (
              <FreebieCard
                key={freebie.id}
                freebie={freebie}
                condensed={isCardCondensed(freebie.id)}
                onToggleCondensed={() => handleToggleCardCondensed(freebie.id)}
                onOpenDetail={() => state.setSelectedFreebieId(freebie.id)}
                onEdit={(f) => state.setEditingFreebie(f)}
                onDelete={(f) => state.setDeletingFreebie(f)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
