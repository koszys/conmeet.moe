'use client';

import { useState, useMemo } from 'react';
import { Plus, RotateCw, Users, X } from 'lucide-react';
import { useConvention } from '@/features/conventions/data/api';
import { Button, LinkButton, EmptyState } from '@/shared/components/ui';
import { MikuLoader } from '@/shared/components/miku';
import { cn } from '@/shared/lib/utils';
import { useMeetups } from '../../api';
import { MeetupCard } from './MeetupCard';
import { MeetupFilterBar, type TabType } from './MeetupFilterBar';
import { MeetupHeader } from './MeetupHeader';

interface MeetupListProps {
  conventionSlug: string;
}

export function MeetupList({ conventionSlug }: MeetupListProps) {
  const { data: convention } = useConvention(conventionSlug);

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);

  // Compute filters for the API query
  const queryFilters = useMemo(() => {
    return {
      conventionSlug,
      date: selectedDate,
      official: activeTab === 'official' ? true : activeTab === 'community' ? false : undefined,
      saved: activeTab === 'saved' ? true : undefined,
      q: searchQuery.trim() || undefined,
    };
  }, [conventionSlug, selectedDate, activeTab, searchQuery]);

  const { data: meetups, isLoading, isError, refetch, isFetching } = useMeetups(queryFilters);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] w-full flex-col items-center justify-center py-12">
        <MikuLoader message="Gathering meetups..." size="lg" />
      </div>
    );
  }

  return (
    <div className="@container space-y-6">
      {/* Header */}
      <MeetupHeader conventionSlug={conventionSlug} conventionName={convention?.name} />

      {/* Filter and Date Bar */}
      <MeetupFilterBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        conventionStartsAt={convention?.starts_at}
        conventionEndsAt={convention?.ends_at}
      />

      {/* Content Grid */}
      {isError ? (
        <div className="border-ink border-2 border-dashed bg-rose-50 p-8 text-center dark:bg-rose-950/20">
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
            Failed to load meetups. Please refresh or check connection.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-ink bg-accent mt-3 inline-flex cursor-pointer items-center gap-1.5 border-2 px-3 py-1.5 text-xs font-bold text-white uppercase shadow-[2px_2px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-950"
          >
            <RotateCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
            <span>{isFetching ? 'Syncing…' : 'Try Refreshing'}</span>
          </button>
        </div>
      ) : meetups && meetups.length > 0 ? (
        <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2">
          {meetups.map((meetup) => (
            <MeetupCard key={meetup.id} meetup={meetup} conventionSlug={conventionSlug} />
          ))}
        </div>
      ) : (
        /* Empty State */
        (() => {
          const isFiltered = Boolean(searchQuery.trim() || selectedDate);

          const emptySpeech = isFiltered
            ? searchQuery.trim()
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

          const emptyDescription = isFiltered
            ? 'No meetups matched your search or date filter. Try clearing filters.'
            : activeTab === 'saved'
              ? 'Bookmark meetups to build your convention plan and schedule.'
              : activeTab === 'official'
                ? 'Official con events and staff-run meetups will appear here.'
                : 'No meetups have been scheduled for this convention yet. Be the first to host one!';

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
                    <Button
                      variant="primary"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedDate(undefined);
                      }}
                    >
                      <X className="h-4 w-4" />
                      <span>Clear Filters</span>
                    </Button>
                    <LinkButton
                      variant="secondary"
                      href={`/conventions/${conventionSlug}/meetups/new`}
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
                    >
                      <Plus className="h-4 w-4" />
                      <span>Post a Meetup</span>
                    </LinkButton>
                    {activeTab !== 'all' && (
                      <Button variant="secondary" onClick={() => setActiveTab('all')}>
                        <Users className="h-4 w-4" />
                        <span>Browse All Meetups</span>
                      </Button>
                    )}
                  </>
                )
              }
            />
          );
        })()
      )}
    </div>
  );
}
