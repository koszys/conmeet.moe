'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { BackLink, CONBLOCK_PRIMARY, EmptyState, tabButtonClasses } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';
import { useMeetup, useMeetupAlbums } from '../../api';
import type { AlbumSortOption } from '../../types';
import { AlbumCard } from './AlbumCard';
import { AlbumCardSkeleton } from './AlbumCardSkeleton';

export interface MeetupCollectionsViewProps {
  conventionSlug: string;
  meetupId: number;
}

export function MeetupCollectionsView({ conventionSlug, meetupId }: MeetupCollectionsViewProps) {
  const [activeSort, setActiveSort] = useState<AlbumSortOption>('popular');

  const { data: meetup } = useMeetup(meetupId);
  const { data: albums, isLoading: isAlbumsLoading } = useMeetupAlbums(meetupId, activeSort);

  const meetupHref = `/conventions/${conventionSlug}/meetups/${meetupId}`;
  const uploadHref = `/conventions/${conventionSlug}/meetups/${meetupId}/collections/new`;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackLink href={meetupHref}>
          {meetup?.name ? `Back to ${meetup.name}` : 'Back to Meetup'}
        </BackLink>

        <Link
          href={uploadHref}
          className={cn(
            CONBLOCK_PRIMARY,
            'inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold tracking-wider uppercase'
          )}
        >
          <Plus className="h-4 w-4" />
          <span>Add Photos</span>
        </Link>
      </div>

      {/* Page Header */}
      <div className="border-ink border-b-2 pb-6">
        <span className="font-display text-accent-pop text-xs tracking-wider uppercase">
          {meetup?.convention_name || 'Convention'} · Meetup Gallery
        </span>
        <h1 className="font-display mt-1 text-2xl font-black tracking-wider uppercase sm:text-3xl">
          {meetup?.name || 'Meetup'} Photos
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Browse photo albums, cosplayer shots, and attendee galleries shared from this meetup.
        </p>
      </div>

      {/* Sorting Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveSort('popular')}
            className={tabButtonClasses(
              activeSort === 'popular',
              'px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase'
            )}
          >
            Most Popular
          </button>
          <button
            type="button"
            onClick={() => setActiveSort('newest')}
            className={tabButtonClasses(
              activeSort === 'newest',
              'px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase'
            )}
          >
            Newest
          </button>
          <button
            type="button"
            onClick={() => setActiveSort('photos')}
            className={tabButtonClasses(
              activeSort === 'photos',
              'px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase'
            )}
          >
            Most Photos
          </button>
        </div>

        {/* Counter */}
        {albums && albums.length > 0 && (
          <span className="font-mono text-xs font-bold text-zinc-500 uppercase dark:text-zinc-400">
            {albums.length} {albums.length === 1 ? 'Album' : 'Albums'}
          </span>
        )}
      </div>

      {/* Albums Grid */}
      {isAlbumsLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <AlbumCardSkeleton key={i} />
          ))}
        </div>
      ) : albums && albums.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              conventionSlug={conventionSlug}
              meetupId={meetupId}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          mascot
          mascotSpeech="Be the first to share photos!"
          title="No Photo Collections Yet"
          description="Did you attend this meetup or take cosplay photos? Upload an album to share your shots and credit your socials!"
          className="mt-6 border-zinc-300 dark:border-zinc-700"
          action={
            <Link
              href={uploadHref}
              className={cn(
                CONBLOCK_PRIMARY,
                'inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold tracking-wider uppercase'
              )}
            >
              <Plus className="h-4 w-4" />
              <span>Upload First Album</span>
            </Link>
          }
        />
      )}
    </div>
  );
}
