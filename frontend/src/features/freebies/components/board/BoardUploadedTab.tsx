'use client';

import { Plus, Search, UploadCloud, X } from 'lucide-react';
import { FreebieCard } from '../FreebieCard';
import { BoardEmptyState } from './BoardEmptyState';
import type { FreebieBoardState } from './types';

interface BoardUploadedTabProps {
  state: FreebieBoardState;
  conventionSlug: string;
}

export function BoardUploadedTab({ state, conventionSlug }: BoardUploadedTabProps) {
  const {
    uploadedDrops,
    isFiltered,
    debouncedSearch,
    handleClearFilters,
    isCardCondensed,
    handleToggleCardCondensed,
  } = state;

  if (uploadedDrops.length === 0) {
    return (
      <BoardEmptyState
        icon={isFiltered ? Search : UploadCloud}
        title={isFiltered ? 'No Matching Uploads' : 'No Uploaded Freebies Yet'}
        description={
          isFiltered
            ? debouncedSearch
              ? `No uploaded freebies match \u201c${debouncedSearch}\u201d. Try clearing your search.`
              : 'No uploaded freebies match the selected vendor filter.'
            : 'You haven\u2019t posted any freebies for this convention yet. Share one with the community!'
        }
        action={
          isFiltered
            ? { label: 'Clear Filters', onClick: handleClearFilters, icon: X }
            : {
                label: 'Post a Freebie',
                href: `/conventions/${conventionSlug}/freebies/new`,
                icon: Plus,
                primary: true,
              }
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {uploadedDrops.map((freebie) => (
        <FreebieCard
          key={freebie.id}
          freebie={freebie}
          condensed={isCardCondensed(freebie.id)}
          onToggleCondensed={() => handleToggleCardCondensed(freebie.id)}
          canManage
        />
      ))}
    </div>
  );
}
