'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RotateCw } from 'lucide-react';
import { useConvention } from '@/features/conventions/data/api';
import { MikuLoader } from '@/shared/components/miku';
import { type RefreshStatus } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';
import { meetupKeys, useMeetups } from '../../api';
import { MeetupCard } from './MeetupCard';
import { MeetupEmptyState } from './MeetupEmptyState';
import { MeetupFilterBar, type TabType } from './MeetupFilterBar';
import { MeetupHeader } from './MeetupHeader';

interface MeetupListProps {
  conventionSlug: string;
}

export function MeetupList({ conventionSlug }: MeetupListProps) {
  const queryClient = useQueryClient();
  const { data: convention } = useConvention(conventionSlug);

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [refreshStatus, setRefreshStatus] = useState<RefreshStatus>('idle');
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  async function handleRefresh() {
    if (refreshStatus !== 'idle') return;
    setRefreshStatus('refreshing');
    try {
      const minDelay = new Promise((resolve) => setTimeout(resolve, 800));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: meetupKeys.all }),
        refetch(),
        minDelay,
      ]);
      setRefreshStatus('success');
      refreshTimeoutRef.current = setTimeout(() => {
        setRefreshStatus('idle');
      }, 1200);
    } catch {
      setRefreshStatus('idle');
    }
  }

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

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
        onRefresh={handleRefresh}
        refreshStatus={refreshStatus}
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
        <MeetupEmptyState
          activeTab={activeTab}
          isFiltered={Boolean(searchQuery.trim() || selectedDate)}
          hasSearchQuery={Boolean(searchQuery.trim())}
          onClearFilters={() => {
            setSearchQuery('');
            setSelectedDate(undefined);
          }}
          onBrowseAll={() => setActiveTab('all')}
          conventionSlug={conventionSlug}
        />
      )}
    </div>
  );
}
