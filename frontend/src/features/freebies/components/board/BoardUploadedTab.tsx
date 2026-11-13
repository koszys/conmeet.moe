'use client';

import { FreebieCard } from '../FreebieCard';
import { FreebieEmptyState } from './FreebieEmptyState';
import type { FreebieBoardState } from './types';

interface BoardUploadedTabProps {
  state: FreebieBoardState;
  conventionSlug: string;
}

export function BoardUploadedTab({ state, conventionSlug }: BoardUploadedTabProps) {
  const {
    uploadedDrops,
    isFiltered,
    handleClearFilters,
    isCardCondensed,
    handleToggleCardCondensed,
  } = state;

  if (uploadedDrops.length === 0) {
    return (
      <FreebieEmptyState
        tab="uploaded"
        isFiltered={isFiltered}
        onClearFilters={handleClearFilters}
        conventionSlug={conventionSlug}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 xl:grid-cols-3 @min-[880px]:grid-cols-3">
      {uploadedDrops.map((freebie) => (
        <FreebieCard
          key={freebie.id}
          freebie={freebie}
          condensed={isCardCondensed(freebie.id)}
          onToggleCondensed={() => handleToggleCardCondensed(freebie.id)}
          canManage
          onOpenDetail={() => state.setSelectedFreebieId(freebie.id)}
          onEdit={(f) => state.setEditingFreebie(f)}
          onDelete={(f) => state.setDeletingFreebie(f)}
        />
      ))}
    </div>
  );
}
