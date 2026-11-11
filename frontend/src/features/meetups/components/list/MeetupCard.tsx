'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock, MapPin, User, Users } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { Badge, BookmarkButton } from '@/shared/components/ui';
import { formatMeetupTimeRange } from '@/shared/lib/dates';
import { useToggleSaveMeetup } from '../../api';
import { GoingButton } from '../GoingButton';
import type { Meetup } from '../../types';

interface MeetupCardProps {
  meetup: Meetup;
  conventionSlug: string;
}

export function MeetupCard({ meetup, conventionSlug }: MeetupCardProps) {
  const { user } = useAuth();
  const toggleSave = useToggleSaveMeetup();

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = `/login?redirect=/conventions/${conventionSlug}/meetups`;
      return;
    }
    toggleSave.mutate(meetup.id);
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
            sizes="(max-width: 640px) 100vw, 50vw"
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
            <Badge variant="pop" size="sm">
              Official Meetup
            </Badge>
          ) : (
            <Badge
              variant="default"
              size="sm"
              className="bg-white/95 backdrop-blur-xs dark:bg-zinc-900/95"
            >
              Community
            </Badge>
          )}
        </div>
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
          <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-500 dark:text-zinc-400" />
            <span className="truncate">{meetup.location}</span>
          </div>
        )}

        {/* Creator credit */}
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-300">
          <User className="h-3 w-3 shrink-0 text-zinc-500 dark:text-zinc-400" />
          <span>
            Posted by{' '}
            <strong className="font-semibold text-zinc-700 dark:text-zinc-200">
              @{meetup.created_by_name || 'Fan'}
            </strong>
          </span>
        </div>

        {/* Action footer */}
        <div className="pointer-events-auto relative z-10 mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            {/* Going button */}
            <GoingButton meetup={meetup} conventionSlug={conventionSlug} size="sm" />

            {/* Bookmark button */}
            <BookmarkButton
              isSaved={meetup.is_saved}
              onClick={handleToggleSave}
              title={meetup.is_saved ? 'Remove from saved' : 'Save meetup'}
              ariaLabel={meetup.is_saved ? 'Remove from saved' : 'Save meetup'}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
