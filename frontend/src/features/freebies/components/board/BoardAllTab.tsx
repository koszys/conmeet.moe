'use client';

import { Bookmark, Gift, Plus, Search, X } from 'lucide-react';
import { FreebieCard } from '../FreebieCard';
import { BoardEmptyState } from './BoardEmptyState';
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
  } = state;

  if (allDrops.length === 0) {
    return (
      <BoardEmptyState
        icon={isFiltered ? Search : Gift}
        title={isFiltered ? 'No Matching Freebies Found' : 'No Active Freebies Found'}
        description={
          isFiltered
            ? 'No freebies matched your search or vendor filter. Try clearing filters.'
            : 'No active freebies found for this convention yet. Be the first to share one!'
        }
        action={
          isFiltered
            ? { label: 'Clear Filters', onClick: handleClearFilters, icon: X }
            : {
                label: 'Submit First Freebie',
                href: `/conventions/${conventionSlug}/freebies/new`,
                icon: Plus,
                primary: true,
              }
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Unsaved drops (Top) */}
      {unsavedDrops.length > 0 && (
        <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {unsavedDrops.map((freebie) => (
            <FreebieCard
              key={freebie.id}
              freebie={freebie}
              condensed={isCardCondensed(freebie.id)}
              onToggleCondensed={() => handleToggleCardCondensed(freebie.id)}
            />
          ))}
        </div>
      )}

      {/* Saved Drops (Bottom - Separated out of the way) */}
      {savedDrops.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="border-ink flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <Bookmark className="text-accent h-4 w-4 fill-current" />
              <h2 className="font-display text-sm tracking-wider uppercase sm:text-base">Saved</h2>
              <span className="border-ink/20 border bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {savedDrops.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {savedDrops.map((freebie) => (
              <FreebieCard
                key={freebie.id}
                freebie={freebie}
                condensed={isCardCondensed(freebie.id)}
                onToggleCondensed={() => handleToggleCardCondensed(freebie.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
