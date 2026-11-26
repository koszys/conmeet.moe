'use client';

import { Plus, Users } from 'lucide-react';
import { useConvention } from '@/features/conventions/data/api';
import { isMeetupMutationLocked } from '@/features/conventions/utils/dates';
import { Button, ClearFiltersButton, EmptyState, LinkButton } from '@/shared/components/ui';
import type { TabType } from './MeetupFilterBar';

export interface MeetupEmptyStateProps {
  activeTab: TabType;
  isFiltered: boolean;
  onClearFilters: () => void;
  onBrowseAll?: () => void;
  conventionSlug: string;
  hasSearchQuery?: boolean;
}

export function MeetupEmptyState({
  activeTab,
  isFiltered,
  onClearFilters,
  onBrowseAll,
  conventionSlug,
  hasSearchQuery = true,
}: MeetupEmptyStateProps) {
  const { data: convention } = useConvention(conventionSlug);
  const isLocked = isMeetupMutationLocked(convention);
  const lockedTitle = isLocked
    ? 'Meetups cannot be added more than one week after the convention has ended'
    : undefined;
  const emptySpeech = isFiltered
    ? hasSearchQuery
      ? 'Try another search!'
      : 'Try another day!'
    : activeTab === 'saved'
      ? 'Save some meetups!'
      : activeTab === 'official'
        ? 'Checking with staff!'
        : 'Host a meetup!';

  const emptyTitle = isFiltered
    ? activeTab === 'saved'
      ? 'No Matching Saved Meetups'
      : activeTab === 'official'
        ? 'No Matching Official Meetups'
        : 'No Matching Meetups Found'
    : activeTab === 'saved'
      ? 'No Saved Meetups Yet'
      : activeTab === 'official'
        ? 'No Official Meetups Listed'
        : 'No Meetups Scheduled Yet';

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
            <LinkButton
              variant="secondary"
              href={`/conventions/${conventionSlug}/meetups/new`}
              disabled={isLocked}
              title={lockedTitle}
            >
              <Plus className="h-4 w-4" />
              <span>Post a Meetup</span>
            </LinkButton>
          </>
        ) : (
          <>
            <LinkButton
              variant="primary"
              href={`/conventions/${conventionSlug}/meetups/new`}
              disabled={isLocked}
              title={lockedTitle}
            >
              <Plus className="h-4 w-4" />
              <span>Post a Meetup</span>
            </LinkButton>
            {activeTab !== 'all' && onBrowseAll && (
              <Button variant="secondary" onClick={onBrowseAll}>
                <Users className="h-4 w-4" />
                <span>Browse All Meetups</span>
              </Button>
            )}
          </>
        )
      }
    />
  );
}
