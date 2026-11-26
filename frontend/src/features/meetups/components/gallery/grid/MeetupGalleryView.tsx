'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { Bookmark, Camera, Clock, Images, Plus, Sparkles } from 'lucide-react';
import { MikuLoader } from '@/shared/components/miku';
import {
  BackLink,
  CONBLOCK_PRIMARY,
  CopyLinkButton,
  EmptyState,
  FilterTab,
  RefreshButton,
  type RefreshStatus,
} from '@/shared/components/ui';
import { useHorizontalScrollAffordance } from '@/shared/hooks';
import { useGuestSaves } from '@/shared/lib/guestSaves';
import { cn } from '@/shared/lib/utils';
import { useAuth } from '@/features/auth';
import { albumKeys, meetupKeys, useMeetup, useMeetupAlbums, useMeetupSettings } from '../../../api';
import type { AlbumSortOption } from '../../../types';
import { AlbumCard } from './AlbumCard';
import { AlbumCardSkeleton } from './AlbumCardSkeleton';

export interface MeetupGalleryViewProps {
  conventionSlug: string;
  meetupId: number | string;
}

export type MeetupCollectionsViewProps = MeetupGalleryViewProps;

export function MeetupGalleryView({ conventionSlug, meetupId }: MeetupGalleryViewProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeSort, setActiveSort] = useState<AlbumSortOption>('all');
  const [refreshStatus, setRefreshStatus] = useState<RefreshStatus>('idle');
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: meetup, isLoading: isMeetupLoading } = useMeetup(meetupId);
  const { data: meetupSettings } = useMeetupSettings();
  const isGalleryUnmounted =
    Boolean(meetup?.unmount_albums) || Boolean(meetupSettings?.unmount_all_albums);
  const {
    data: albums,
    isLoading: isAlbumsLoading,
    refetch: refetchAlbums,
  } = useMeetupAlbums(meetupId, !user && activeSort === 'saved' ? 'all' : activeSort);
  const { isGuestSaved } = useGuestSaves();

  const displayedAlbums = useMemo(() => {
    if (!albums) return [];
    if (!user && activeSort === 'saved') {
      return albums.filter((a) => isGuestSaved('albums', a.id));
    }
    return albums;
  }, [albums, user, activeSort, isGuestSaved]);

  async function handleRefresh() {
    if (refreshStatus !== 'idle') return;
    setRefreshStatus('refreshing');
    try {
      const minDelay = new Promise((resolve) => setTimeout(resolve, 800));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: albumKeys.all }),
        queryClient.invalidateQueries({ queryKey: meetupKeys.detail(meetupId) }),
        refetchAlbums(),
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

  const meetupSlugOrId = meetup?.slug || meetupId;
  const meetupHref = `/conventions/${conventionSlug}/meetups/${meetupSlugOrId}`;
  const uploadHref = `/conventions/${conventionSlug}/meetups/${meetupSlugOrId}/gallery/new`;

  const {
    ref: tabsRef,
    maskStyle: tabsMaskStyle,
    checkScroll: checkTabsScroll,
  } = useHorizontalScrollAffordance({
    fadeWidth: 28,
  });

  useEffect(() => {
    checkTabsScroll();
  }, [albums, activeSort, checkTabsScroll]);

  if (isMeetupLoading || (isAlbumsLoading && !albums)) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center py-16">
        <MikuLoader message="Loading photo gallery..." size="lg" />
      </div>
    );
  }

  if (isGalleryUnmounted) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <div className="border-ink border-2 bg-white p-6 shadow-[6px_6px_0_var(--ink)] sm:p-8 dark:bg-zinc-900">
          <div className="mb-4">
            <BackLink href={meetupHref}>Back to {meetup?.name || 'Meetup'}</BackLink>
          </div>
          <EmptyState
            title="Photo Gallery Unavailable"
            description="The photo gallery is currently disabled for this meetup."
            action={
              <Link
                href={meetupHref}
                className={cn(CONBLOCK_PRIMARY, 'inline-flex items-center px-4 py-2')}
              >
                Back to Meetup
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="border-ink @container border-b-2 pb-5">
        <BackLink href={meetupHref}>
          {meetup?.name ? `Back to ${meetup.name}` : 'Back to Meetup'}
        </BackLink>

        <div className="mt-3 flex flex-col justify-between gap-4 @min-[720px]:flex-row @min-[720px]:items-end">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="border-ink bg-accent-soft/25 mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center border-2 shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-800">
              <Camera className="text-ink h-5 w-5 dark:text-zinc-100" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-xl tracking-wide uppercase min-[380px]:text-2xl sm:text-3xl">
                Photo Gallery
              </h1>
              <p className="mt-0.5 text-xs text-zinc-600 sm:text-sm dark:text-zinc-300">
                Attendee photo albums and memories from this meetup.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <CopyLinkButton variant="responsive" />
            <Link
              href={uploadHref}
              title="Add Photos"
              aria-label="Add Photos"
              className={cn(
                CONBLOCK_PRIMARY,
                'inline-flex h-10 items-center justify-center gap-1.5 px-3 text-xs font-bold whitespace-nowrap uppercase @min-[680px]:gap-2 @min-[680px]:px-5'
              )}
            >
              <Plus className="h-4 w-4 shrink-0 stroke-3" />
              <span className="hidden @min-[680px]:inline">Add Photos</span>
              <span className="@min-[680px]:hidden">Add</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-ink flex flex-wrap items-center justify-between gap-3 border-b-2 pb-5">
        <div
          ref={tabsRef}
          style={tabsMaskStyle}
          className="flex min-w-0 flex-1 scrollbar-none items-center gap-1.5 overflow-x-auto p-0.5 sm:flex-initial sm:gap-2"
        >
          <FilterTab
            isActive={activeSort === 'all'}
            onClick={() => setActiveSort('all')}
            title="All Albums"
            ariaLabel="All Albums"
            label="All Albums"
            shortLabel="All"
            icon={
              <Images
                className={cn(
                  'h-4 w-4 shrink-0',
                  activeSort === 'all' ? 'stroke-[2.5]' : 'stroke-2'
                )}
              />
            }
          />
          <FilterTab
            isActive={activeSort === 'popular'}
            onClick={() => setActiveSort('popular')}
            title="Most Popular Albums"
            ariaLabel="Most Popular Albums"
            label="Most Popular"
            shortLabel="Popular"
            icon={
              <Sparkles
                className={cn(
                  'h-4 w-4 shrink-0',
                  activeSort === 'popular' ? 'fill-current stroke-[2.5]' : 'stroke-2'
                )}
              />
            }
          />
          <FilterTab
            isActive={activeSort === 'newest'}
            onClick={() => setActiveSort('newest')}
            title="Newest Albums"
            ariaLabel="Newest Albums"
            label="Newest"
            shortLabel="Newest"
            icon={
              <Clock
                className={cn(
                  'h-4 w-4 shrink-0',
                  activeSort === 'newest' ? 'stroke-[2.5]' : 'stroke-2'
                )}
              />
            }
          />
          <FilterTab
            isActive={activeSort === 'saved'}
            onClick={() => setActiveSort('saved')}
            title="Saved Albums"
            ariaLabel="Saved Albums"
            label="Saved"
            shortLabel="Saved"
            icon={
              <Bookmark
                className={cn(
                  'h-4 w-4 shrink-0',
                  activeSort === 'saved' ? 'fill-current stroke-[2.5]' : 'stroke-2'
                )}
              />
            }
          />
          {/* Scroll spacer */}
          <div className="w-6 shrink-0 sm:hidden" aria-hidden="true" />
        </div>

        {/* Refresh */}
        <div className="shrink-0">
          <RefreshButton onRefresh={handleRefresh} status={refreshStatus} entityName="gallery" />
        </div>
      </div>

      {/* Albums Grid */}
      {isAlbumsLoading ? (
        <div className="grid grid-cols-1 gap-3.5 min-[380px]:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <AlbumCardSkeleton key={i} />
          ))}
        </div>
      ) : displayedAlbums && displayedAlbums.length > 0 ? (
        <div className="grid grid-cols-1 gap-3.5 min-[380px]:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {displayedAlbums.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              conventionSlug={conventionSlug}
              meetupId={meetupSlugOrId}
            />
          ))}
        </div>
      ) : activeSort === 'saved' ? (
        <EmptyState
          mascot
          mascotSpeech="No saved albums yet!"
          title="No Saved Albums"
          className="mt-6 border-zinc-300 dark:border-zinc-700"
          action={
            <button
              type="button"
              onClick={() => setActiveSort('all')}
              className={cn(
                CONBLOCK_PRIMARY,
                'inline-flex cursor-pointer items-center gap-1.5 px-4 py-2.5 text-xs font-bold tracking-wider whitespace-nowrap uppercase'
              )}
            >
              <Images className="h-4 w-4 shrink-0" />
              <span>Browse All Albums</span>
            </button>
          }
        />
      ) : (
        <EmptyState
          mascot
          mascotSpeech="Be the first to share photos!"
          title="No Photos in Gallery Yet"
          className="mt-6 border-zinc-300 dark:border-zinc-700"
          action={
            <Link
              href={uploadHref}
              className={cn(
                CONBLOCK_PRIMARY,
                'inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold tracking-wider whitespace-nowrap uppercase'
              )}
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Upload First Album</span>
              <span className="sm:hidden">Upload Album</span>
            </Link>
          }
        />
      )}
    </div>
  );
}
