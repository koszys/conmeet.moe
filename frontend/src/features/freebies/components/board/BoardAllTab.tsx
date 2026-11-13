'use client';

import { Bookmark, Gift } from 'lucide-react';
import { FreebieCard } from '../FreebieCard';
import { BoardSectionHeader } from './BoardSectionHeader';
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
    isAvailableCollapsed,
    setIsAvailableCollapsed,
    isSavedCollapsed,
    setIsSavedCollapsed,
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
      <section className="space-y-4">
        <BoardSectionHeader
          title="Available to Claim"
          count={unsavedDrops.length}
          icon={Gift}
          isCollapsed={isAvailableCollapsed}
          onToggle={() => setIsAvailableCollapsed((prev) => !prev)}
        />

        {!isAvailableCollapsed &&
          (unsavedDrops.length > 0 ? (
            <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 xl:grid-cols-3 @min-[880px]:grid-cols-3">
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
            <div className="border-ink border-2 border-dashed bg-zinc-50/70 p-6 text-center dark:bg-zinc-900/50">
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
          ))}
      </section>

      {/* Saved drops (Bottom) */}
      {savedDrops.length > 0 && (
        <section className="space-y-4 pt-2">
          <BoardSectionHeader
            title="Saved to Your List"
            count={savedDrops.length}
            icon={Bookmark}
            isCollapsed={isSavedCollapsed}
            onToggle={() => setIsSavedCollapsed((prev) => !prev)}
          />

          {!isSavedCollapsed && (
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
          )}
        </section>
      )}
    </div>
  );
}
