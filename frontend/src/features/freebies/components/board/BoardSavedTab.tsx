'use client';

import { Bookmark, Check, CheckSquare, ChevronDown, Gift, Search, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { FreebieCard } from '../FreebieCard';
import { BoardEmptyState } from './BoardEmptyState';
import type { FreebieBoardState } from './types';

interface BoardSavedTabProps {
  state: FreebieBoardState;
}

export function BoardSavedTab({ state }: BoardSavedTabProps) {
  const {
    counts,
    isFiltered,
    debouncedSearch,
    handleClearFilters,
    setActiveTab,
    unclaimedSaved,
    claimedSaved,
    isToClaimCollapsed,
    setIsToClaimCollapsed,
    isClaimedCollapsed,
    setIsClaimedCollapsed,
    isCardCondensed,
    handleToggleCardCondensed,
  } = state;

  if (counts.saved === 0) {
    return (
      <BoardEmptyState
        icon={isFiltered ? Search : Bookmark}
        title={isFiltered ? 'No Matching Saved Freebies' : 'No Saved Freebies Yet'}
        description={
          isFiltered
            ? debouncedSearch
              ? `No saved freebies match \u201c${debouncedSearch}\u201d. Try clearing your search.`
              : 'No saved freebies match the selected vendor filter.'
            : 'Bookmark freebies to build your personal checklist for the convention floor.'
        }
        action={
          isFiltered
            ? { label: 'Clear Filters', onClick: handleClearFilters, icon: X }
            : { label: 'Browse All', onClick: () => setActiveTab('all'), icon: Gift }
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Section 1: To Claim */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setIsToClaimCollapsed((prev) => !prev)}
          className="border-ink flex w-full cursor-pointer items-center justify-between border-b pb-2 text-left transition-opacity hover:opacity-80"
          aria-expanded={!isToClaimCollapsed}
        >
          <div className="flex items-center gap-2">
            <CheckSquare className="text-accent h-4 w-4" />
            <h2 className="font-display text-sm tracking-wider uppercase sm:text-base">To Claim</h2>
            <span className="border-ink/20 border bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {unclaimedSaved.length}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                isToClaimCollapsed && '-rotate-90'
              )}
            />
          </div>
        </button>

        {!isToClaimCollapsed &&
          (unclaimedSaved.length > 0 ? (
            <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {unclaimedSaved.map((freebie) => (
                <FreebieCard
                  key={freebie.id}
                  freebie={freebie}
                  condensed={isCardCondensed(freebie.id)}
                  onToggleCondensed={() => handleToggleCardCondensed(freebie.id)}
                />
              ))}
            </div>
          ) : isFiltered ? (
            <div className="border-ink border-2 border-dashed bg-zinc-50/70 p-5 text-center dark:bg-zinc-900/50">
              <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                No unclaimed freebies match{' '}
                {debouncedSearch ? (
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    &ldquo;{debouncedSearch}&rdquo;
                  </span>
                ) : (
                  'the active filter'
                )}
                .
              </p>
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-300">
                Check the Claimed section below for matching drops.
              </p>
            </div>
          ) : (
            <div className="border-ink border-2 border-dashed bg-zinc-50/70 p-6 text-center dark:bg-zinc-900/50">
              <div className="border-ink bg-accent mx-auto flex h-9 w-9 items-center justify-center border-2 text-white shadow-[2px_2px_0_var(--ink)] dark:text-zinc-950">
                <Check className="h-5 w-5 stroke-3" />
              </div>
              <p className="mt-2 text-xs font-bold text-zinc-800 sm:text-sm dark:text-zinc-200">
                All caught up! You&apos;ve claimed all of your saved freebies.
              </p>
            </div>
          ))}
      </div>

      {/* Section 2: Claimed */}
      {claimedSaved.length > 0 && (
        <div className="space-y-4 pt-2">
          <button
            type="button"
            onClick={() => setIsClaimedCollapsed((prev) => !prev)}
            className="border-ink flex w-full cursor-pointer items-center justify-between border-b pb-2 text-left transition-opacity hover:opacity-80"
            aria-expanded={!isClaimedCollapsed}
          >
            <div className="flex items-center gap-2">
              <Check className="text-accent h-4 w-4 stroke-3" />
              <h2 className="font-display text-sm tracking-wider uppercase sm:text-base">
                Claimed
              </h2>
              <span className="border-ink/20 border bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {claimedSaved.length}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  isClaimedCollapsed && '-rotate-90'
                )}
              />
            </div>
          </button>

          {!isClaimedCollapsed && (
            <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {claimedSaved.map((freebie) => (
                <FreebieCard
                  key={freebie.id}
                  freebie={freebie}
                  condensed={isCardCondensed(freebie.id)}
                  onToggleCondensed={() => handleToggleCardCondensed(freebie.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
