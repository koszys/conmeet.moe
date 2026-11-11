'use client';

import { Bookmark, Plus, X } from 'lucide-react';
import { Button, LinkButton, EmptyState } from '@/shared/components/ui';
import { FreebieCard } from '../FreebieCard';
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
      <EmptyState
        mascot
        mascotSpeech={isFiltered ? 'Try another search!' : 'Be the first to upload!'}
        title={isFiltered ? 'No Matching Freebies Found' : 'No Active Freebies Found'}
        description={
          isFiltered
            ? 'No freebies matched your search or vendor filter. Try clearing filters.'
            : 'No active freebies found for this convention yet. Be the first to share one!'
        }
        shadow
        action={
          isFiltered ? (
            <>
              <Button variant="primary" onClick={handleClearFilters}>
                <X className="h-4 w-4" />
                <span>Clear Filters</span>
              </Button>
              <LinkButton variant="secondary" href={`/conventions/${conventionSlug}/freebies/new`}>
                <Plus className="h-4 w-4" />
                <span>Post a Freebie</span>
              </LinkButton>
            </>
          ) : (
            <LinkButton variant="primary" href={`/conventions/${conventionSlug}/freebies/new`}>
              <Plus className="h-4 w-4" />
              <span>Post a Freebie</span>
            </LinkButton>
          )
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Unsaved drops (Top) */}
      {unsavedDrops.length > 0 && (
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
        </div>
      )}
    </div>
  );
}
