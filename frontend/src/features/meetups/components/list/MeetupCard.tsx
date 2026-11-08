'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Check, Clock, MapPin, User, Users } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { BookmarkButton, CONBLOCK } from '@/shared/components/ui';
import { formatMeetupTimeRange } from '@/shared/lib/dates';
import { cn } from '@/shared/lib/utils';
import { useToggleGoingMeetup, useToggleSaveMeetup } from '../../api';
import type { Meetup } from '../../types';

interface MeetupCardProps {
  meetup: Meetup;
  conventionSlug: string;
}

export function MeetupCard({ meetup, conventionSlug }: MeetupCardProps) {
  const { user } = useAuth();
  const toggleSave = useToggleSaveMeetup();
  const toggleGoing = useToggleGoingMeetup();

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = `/login?redirect=/conventions/${conventionSlug}/meetups`;
      return;
    }
    toggleSave.mutate(meetup.id);
  };

  const handleToggleGoing = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = `/login?redirect=/conventions/${conventionSlug}/meetups`;
      return;
    }
    toggleGoing.mutate(meetup.id);
  };

  const meetupHref = `/conventions/${conventionSlug}/meetups/${meetup.id}`;
  const imageUrl = meetup.image_thumb || meetup.image;

  return (
    <article className="border-ink group relative flex flex-col border-2 bg-white shadow-[4px_4px_0_var(--ink)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--ink)] dark:bg-zinc-900">
      {/* Clickable area for meetup navigation (excludes bottom action footer) */}
      <Link
        href={meetupHref}
        aria-label={`View ${meetup.name}`}
        className="absolute inset-x-0 top-0 bottom-14 z-0 cursor-pointer"
      />

      {/* Banner / Artwork preview */}
      <div className="border-ink pointer-events-none relative block aspect-[16/9] w-full overflow-hidden border-b-2 bg-zinc-100 dark:bg-zinc-800">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={meetup.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center text-zinc-400 dark:text-zinc-500">
            <Users className="h-10 w-10 opacity-30" />
            <span className="font-display mt-2 text-[11px] tracking-wider uppercase opacity-60">
              Community Cosplay Meetup
            </span>
          </div>
        )}

        {/* Badges on artwork */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          {meetup.is_official ? (
            <span className="border-ink bg-accent-pop px-2 py-0.5 text-[10px] font-bold text-white uppercase shadow-[2px_2px_0_var(--ink)]">
              Official Meetup
            </span>
          ) : (
            <span className="border-ink bg-white/95 px-2 py-0.5 text-[10px] font-bold text-zinc-800 uppercase shadow-[2px_2px_0_var(--ink)] backdrop-blur-xs dark:bg-zinc-900/95 dark:text-zinc-200">
              Community
            </span>
          )}
        </div>

        {/* Quick bookmark button on image */}
        <BookmarkButton
          isSaved={meetup.is_saved}
          onClick={handleToggleSave}
          title={meetup.is_saved ? 'Remove from saved' : 'Save meetup'}
          ariaLabel={meetup.is_saved ? 'Remove from saved' : 'Save meetup'}
          className="pointer-events-auto absolute top-2.5 right-2.5 z-10"
        />
      </div>

      {/* Card Content */}
      <div className="pointer-events-none flex flex-1 flex-col p-4 sm:p-5">
        {/* Date & Time pill */}
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {formatMeetupTimeRange(meetup.starts_at, meetup.ends_at)}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display group-hover:text-accent-pop text-base leading-snug tracking-wide uppercase transition-colors sm:text-lg">
          {meetup.name}
        </h3>

        {/* Location */}
        {meetup.location && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
            <span className="truncate">{meetup.location}</span>
          </div>
        )}

        {/* Creator credit */}
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
          <User className="h-3 w-3 shrink-0" />
          <span>
            Posted by{' '}
            <strong className="font-semibold text-zinc-700 dark:text-zinc-300">
              @{meetup.created_by_name || 'Fan'}
            </strong>
          </span>
        </div>

        {/* Action footer */}
        <div className="pointer-events-auto relative z-10 mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-zinc-800">
          {/* Going button */}
          <button
            type="button"
            onClick={handleToggleGoing}
            title={meetup.is_going ? "Cancel I'm Going" : "I'm Going!"}
            aria-label={meetup.is_going ? "Cancel I'm Going" : "I'm Going!"}
            className={cn(
              CONBLOCK,
              'pointer-events-auto relative z-10 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase',
              meetup.is_going
                ? 'bg-accent text-white dark:text-zinc-950'
                : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
            )}
          >
            {meetup.is_going ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Users className="h-3.5 w-3.5" />
            )}
            <span>{meetup.is_going ? "I'm Going!" : 'Going!'}</span>
            <span
              className={cn(
                'ml-1 inline-flex items-center justify-center rounded-[2px] px-1.5 py-0.5 font-mono text-[10px] leading-none font-bold',
                meetup.is_going
                  ? 'border border-white/40 bg-white/20 text-white dark:border-black/30 dark:bg-black/20 dark:text-zinc-950'
                  : 'border-ink/20 border bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
              )}
            >
              {meetup.going_count}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
