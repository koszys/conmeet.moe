'use client';

import { Gift, Plus } from 'lucide-react';
import { Button, ClearFiltersButton, EmptyState, LinkButton } from '@/shared/components/ui';

export type FreebieBoardTab = 'all' | 'saved' | 'uploaded';

export interface FreebieEmptyStateProps {
  tab: FreebieBoardTab;
  isFiltered: boolean;
  onClearFilters: () => void;
  onBrowseAll?: () => void;
  conventionSlug?: string;
}

export function FreebieEmptyState({
  tab,
  isFiltered,
  onClearFilters,
  onBrowseAll,
  conventionSlug,
}: FreebieEmptyStateProps) {
  const emptySpeech = isFiltered
    ? 'Try another search!'
    : tab === 'saved'
      ? 'Track your freebies!'
      : tab === 'uploaded'
        ? 'Share some freebies!'
        : 'Be the first to upload!';

  const emptyTitle = isFiltered
    ? tab === 'saved'
      ? 'No Matching Saved Freebies'
      : tab === 'uploaded'
        ? 'No Matching Uploads'
        : 'No Matching Freebies Found'
    : tab === 'saved'
      ? 'No Saved Freebies Yet'
      : tab === 'uploaded'
        ? 'No Uploaded Freebies Yet'
        : 'No Active Freebies Found';

  const emptyDescription = isFiltered
    ? 'No freebies matched your search or vendor filter. Try clearing filters.'
    : tab === 'saved'
      ? 'Bookmark some freebies!'
      : tab === 'uploaded'
        ? 'Share freebies with others!'
        : 'No active freebies found for this convention yet. Be the first to share one!';

  return (
    <EmptyState
      mascot
      mascotSpeech={emptySpeech}
      title={emptyTitle}
      description={emptyDescription}
      shadow
      action={
        isFiltered ? (
          <>
            <ClearFiltersButton onClear={onClearFilters} />
            {tab === 'saved' && onBrowseAll ? (
              <Button variant="secondary" onClick={onBrowseAll}>
                <Gift className="h-4 w-4" />
                <span>Browse All Freebies</span>
              </Button>
            ) : conventionSlug ? (
              <LinkButton variant="secondary" href={`/conventions/${conventionSlug}/freebies/new`}>
                <Plus className="h-4 w-4" />
                <span>Post a Freebie</span>
              </LinkButton>
            ) : null}
          </>
        ) : tab === 'saved' && onBrowseAll ? (
          <Button variant="primary" onClick={onBrowseAll}>
            <Gift className="h-4 w-4" />
            <span>Browse All Freebies</span>
          </Button>
        ) : conventionSlug ? (
          <LinkButton variant="primary" href={`/conventions/${conventionSlug}/freebies/new`}>
            <Plus className="h-4 w-4" />
            <span>Post a Freebie</span>
          </LinkButton>
        ) : null
      }
    />
  );
}
