'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, Check, Clock, Edit3, MapPin, Trash2, User, Users } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { BackLink, BookmarkButton, CONBLOCK, CopyLinkButton } from '@/shared/components/ui';
import { formatMeetupTimeRange } from '@/shared/lib/dates';
import { cn } from '@/shared/lib/utils';
import { useMeetup, useToggleGoingMeetup, useToggleSaveMeetup } from '../../api';
import { MeetupForm } from '../form';
import { MeetupDetailSkeleton } from './MeetupDetailSkeleton';
import { DeleteMeetupModal } from './DeleteMeetupModal';

interface MeetupDetailViewProps {
  conventionSlug: string;
  meetupId: number;
}

export function MeetupDetailView({ conventionSlug, meetupId }: MeetupDetailViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { data: meetup, isLoading, isError } = useMeetup(meetupId);
  const toggleSave = useToggleSaveMeetup();
  const toggleGoing = useToggleGoingMeetup();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [isEditing]);

  const handleOpenEdit = () => {
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  if (isLoading) {
    return <MeetupDetailSkeleton />;
  }

  if (isError || !meetup) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6">
        <div className="border-ink inline-block border-2 bg-white p-8 shadow-[6px_6px_0_var(--ink)] dark:bg-zinc-900">
          <h2 className="font-display text-xl font-bold uppercase">Meetup Not Found</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            This meetup may have been moved or removed by the host.
          </p>
          <div className="mt-6">
            <Link
              href={`/conventions/${conventionSlug}/meetups`}
              className="border-ink bg-accent inline-flex items-center border-2 px-4 py-2 text-xs font-bold text-white uppercase shadow-[2px_2px_0_var(--ink)] hover:opacity-95 dark:text-zinc-950"
            >
              Back to All Meetups
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <MeetupForm
          conventionSlug={conventionSlug}
          initialData={meetup}
          onSuccess={handleCloseEdit}
          onCancel={handleCloseEdit}
        />
      </div>
    );
  }

  const isOwnerOrAdmin = Boolean(user && (meetup.is_owner || user.role === 'admin'));

  const handleToggleSave = () => {
    if (!user) {
      window.location.href = `/login?redirect=/conventions/${conventionSlug}/meetups/${meetupId}`;
      return;
    }
    toggleSave.mutate(meetup.id);
  };

  const handleToggleGoing = () => {
    if (!user) {
      window.location.href = `/login?redirect=/conventions/${conventionSlug}/meetups/${meetupId}`;
      return;
    }
    toggleGoing.mutate(meetup.id);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      {/* Top Navigation Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackLink href={`/conventions/${conventionSlug}/meetups`}>Back to Meetups</BackLink>

        {isOwnerOrAdmin && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenEdit}
              className={cn(
                CONBLOCK,
                'inline-flex items-center gap-1.5 bg-white px-3 py-1.5 text-xs font-bold text-zinc-800 uppercase dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
              )}
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDeleteOpen(true)}
              className={cn(
                CONBLOCK,
                'inline-flex items-center gap-1.5 bg-red-500 px-3 py-1.5 text-xs font-bold text-white uppercase hover:bg-red-600'
              )}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Hero Card */}
      <article className="border-ink border-2 bg-white shadow-[6px_6px_0_var(--ink)] dark:bg-zinc-900">
        {/* Banner Artwork Preview */}
        {meetup.image ? (
          <div className="border-ink relative aspect-[21/9] w-full overflow-hidden border-b-2 bg-zinc-100 sm:aspect-[24/9] dark:bg-zinc-800">
            <Image
              src={meetup.image}
              alt={meetup.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="border-ink border-b-2 bg-zinc-50 py-10 text-center dark:bg-zinc-950">
            <Users className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" />
            <span className="font-display mt-2 block text-xs tracking-wider text-zinc-400 uppercase">
              Community Cosplay Gathering
            </span>
          </div>
        )}

        <div className="p-4 sm:p-8">
          {/* Status Badges */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {meetup.is_official ? (
              <span className="border-ink bg-accent-pop px-2.5 py-1 text-xs font-bold text-white uppercase shadow-[2px_2px_0_var(--ink)]">
                ★ Official Convention Meetup
              </span>
            ) : (
              <span className="border-ink bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-800 uppercase shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-800 dark:text-zinc-200">
                Community Gathering
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-display text-2xl font-black tracking-wide uppercase sm:text-3xl lg:text-4xl">
            {meetup.name}
          </h1>

          {/* Info Pills */}
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-600 dark:text-zinc-300">
            <div className="flex items-center gap-2 font-semibold text-teal-700 dark:text-teal-400">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{formatMeetupTimeRange(meetup.starts_at, meetup.ends_at)}</span>
            </div>

            {meetup.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-zinc-400" />
                <span>{meetup.location}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 shrink-0 text-zinc-400" />
              <span>
                Organized by{' '}
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {meetup.created_by_name || 'Attendee'}
                </span>
              </span>
            </div>
          </div>

          {/* Action Row: Going + (Save & Link always together on same line) */}
          <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-zinc-200 pt-6 sm:gap-3 dark:border-zinc-800">
            {/* Going Button */}
            <button
              type="button"
              onClick={handleToggleGoing}
              title={meetup.is_going ? "Cancel I'm Going" : "I'm Going!"}
              aria-label={meetup.is_going ? "Cancel I'm Going" : "I'm Going!"}
              className={cn(
                CONBLOCK,
                'inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase sm:px-5',
                meetup.is_going
                  ? 'bg-accent text-white dark:text-zinc-950'
                  : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
              )}
            >
              <Check className={cn('h-4 w-4', meetup.is_going && 'stroke-[3]')} />
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

            {/* Save & Link: Always paired side-by-side on the same line */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              {/* Save Button: Responsive (icon only on mobile, full with text on sm+) */}
              <BookmarkButton
                variant="responsive"
                isSaved={meetup.is_saved}
                onClick={handleToggleSave}
                savedLabel="Saved"
                unsavedLabel="Save Meetup"
              />

              {/* Link Button: Responsive (icon only on mobile, full with text on sm+) */}
              <CopyLinkButton variant="responsive" size="md" label="Share Link" />
            </div>
          </div>
        </div>
      </article>

      {/* Meetup Details & Description */}
      {meetup.description && (
        <section className="border-ink border-2 bg-white p-6 shadow-[4px_4px_0_var(--ink)] sm:p-8 dark:bg-zinc-900">
          <h2 className="font-display border-ink inline-block border-b-2 pb-1 text-sm font-bold tracking-wider uppercase">
            About This Gathering
          </h2>
          <div
            className="[&_a]:text-accent mt-4 space-y-4 text-sm leading-relaxed text-zinc-700 sm:text-base dark:text-zinc-200 [&_a]:underline [&_a]:decoration-dotted [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: meetup.description }}
          />
        </section>
      )}

      {/* Photo Collections & Albums Section */}
      <section className="border-ink border-2 bg-white p-6 shadow-[4px_4px_0_var(--ink)] sm:p-8 dark:bg-zinc-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Camera className="text-accent-pop h-5 w-5" />
              <h2 className="font-display text-base font-bold tracking-wider uppercase sm:text-lg">
                Photo Collections & Albums
              </h2>
            </div>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Attendee photos, albums, and photographer credits for this meetup.
            </p>
          </div>
        </div>

        {/* Empty / Intro state */}
        <div className="mt-6 border-2 border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
          <Camera className="mx-auto h-10 w-10 text-zinc-400 opacity-60" />
          <h3 className="font-display mt-3 text-sm font-bold tracking-wider uppercase">
            No Albums Added Yet
          </h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-zinc-500 dark:text-zinc-400">
            Attended this meetup? Soon you will be able to share your photoshoot folders, credit
            your socials, and download attendee photos right here!
          </p>
        </div>
      </section>

      {/* Delete Confirmation Modal Popup */}
      <DeleteMeetupModal
        meetup={meetup}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onSuccess={() => router.push(`/conventions/${conventionSlug}/meetups`)}
      />
    </div>
  );
}
