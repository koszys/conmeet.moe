'use client';

import { Plus, X } from 'lucide-react';
import { Button, LinkButton, EmptyState } from '@/shared/components/ui';
import { FreebieCard } from '../FreebieCard';
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
      <EmptyState
        mascot
        mascotSpeech={isFiltered ? 'No uploads match!' : 'Share some freebies!'}
        title={isFiltered ? 'No Matching Uploads' : 'No Uploaded Freebies Yet'}
        description={
          isFiltered
            ? 'No freebies matched your search or vendor filter. Try clearing filters.'
            : 'You haven\u2019t posted any freebies for this convention yet. Share one with the community!'
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
