'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, RotateCw, Users } from 'lucide-react';
import { useConvention } from '@/features/conventions/data/api';
import { CONBLOCK, CONBLOCK_PRIMARY } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';
import { useMeetups } from '../../api';
import { MeetupCard } from './MeetupCard';
import { MeetupFilterBar, type TabType } from './MeetupFilterBar';
import { MeetupHeader } from './MeetupHeader';
import { MeetupSkeleton } from './MeetupSkeleton';

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
      {isLoading ? (
        <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <MeetupSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
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
        <div className="border-ink flex flex-col items-center justify-center border-2 border-dashed bg-white p-8 text-center sm:p-12 dark:bg-zinc-900">
          <div className="border-ink flex h-14 w-14 items-center justify-center rounded-full border-2 bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
            <Users className="h-7 w-7" />
          </div>
          <h3 className="font-display mt-4 text-lg tracking-wide uppercase sm:text-xl">
            {activeTab === 'saved'
              ? 'No Saved Meetups Yet'
              : activeTab === 'official'
                ? 'No Official Meetups Listed'
                : 'No Meetups Scheduled Yet'}
          </h3>
          <p className="mt-1.5 max-w-sm text-xs text-zinc-600 sm:text-sm dark:text-zinc-300">
            {activeTab === 'saved'
              ? 'Bookmark meetups to build your convention plan and schedule.'
              : 'Organize a fandom meetup for this con!'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href={`/conventions/${conventionSlug}/meetups/new`}
              className={cn(
                CONBLOCK_PRIMARY,
                'inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase'
              )}
            >
              <Plus className="h-4 w-4" />
              <span>Post a Meetup</span>
            </Link>
            {(activeTab !== 'all' || searchQuery || selectedDate) && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('all');
                  setSearchQuery('');
                  setSelectedDate(undefined);
                }}
                className={cn(
                  CONBLOCK,
                  'inline-flex items-center gap-1.5 bg-zinc-50 px-4 py-2 text-xs font-bold uppercase hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700'
                )}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
