'use client';

import { Bookmark, Gift, Plus } from 'lucide-react';
import { useConvention } from '@/features/conventions/data/api';
import { isFreebieMutationLocked } from '@/features/conventions/utils/dates';
import { Button, ClearFiltersButton, EmptyState, LinkButton } from '@/shared/components/ui';

export type FreebieBoardTab = 'all' | 'saved' | 'uploaded';

export interface FreebieEmptyStateProps {
  tab: FreebieBoardTab;
  isFiltered: boolean;
  onClearFilters: () => void;
  onBrowseAll?: () => void;
  onViewSaved?: () => void;
  conventionSlug?: string;
  hasSaved?: boolean;
}

export function FreebieEmptyState({
  tab,
  isFiltered,
  onClearFilters,
  onBrowseAll,
  onViewSaved,
  conventionSlug,
  hasSaved = false,
}: FreebieEmptyStateProps) {
  const { data: convention } = useConvention(conventionSlug || '');
  const isLocked = isFreebieMutationLocked(convention);
  const lockedTitle = isLocked
    ? 'Freebies cannot be added after the convention has ended'
    : undefined;
  const emptySpeech = isFiltered
    ? 'Try another search!'
    : tab === 'saved'
      ? 'Track your freebies!'
      : tab === 'uploaded'
        ? 'Share some freebies!'
        : hasSaved
          ? 'All freebies saved!'
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
        : hasSaved
          ? 'All Freebies Saved/Claimed!'
          : 'No Active Freebies Found';

  return (
    <EmptyState
      mascot
      mascotSpeech={emptySpeech}
      title={emptyTitle}
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
              <LinkButton
                variant="secondary"
                href={`/conventions/${conventionSlug}/freebies/new`}
                disabled={isLocked}
                title={lockedTitle}
              >
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
        ) : hasSaved && onViewSaved ? (
          <>
            <Button variant="primary" onClick={onViewSaved}>
              <Bookmark className="h-4 w-4" />
              <span>View Saved Freebies</span>
            </Button>
            {conventionSlug ? (
              <LinkButton
                variant="secondary"
                href={`/conventions/${conventionSlug}/freebies/new`}
                disabled={isLocked}
                title={lockedTitle}
              >
                <Plus className="h-4 w-4" />
                <span>Post a Freebie</span>
              </LinkButton>
            ) : null}
          </>
        ) : conventionSlug ? (
          <LinkButton
            variant="primary"
            href={`/conventions/${conventionSlug}/freebies/new`}
            disabled={isLocked}
            title={lockedTitle}
          >
            <Plus className="h-4 w-4" />
            <span>Post a Freebie</span>
          </LinkButton>
        ) : null
      }
    />
  );
}
