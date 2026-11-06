'use client';

import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import { BackLink, CONBLOCK_PRIMARY, CopyLinkButton } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';

interface MeetupHeaderProps {
  conventionSlug: string;
  conventionName?: string;
}

export function MeetupHeader({ conventionSlug, conventionName }: MeetupHeaderProps) {
  return (
    <div className="border-ink @container border-b-2 pb-5">
      <BackLink href={`/conventions/${conventionSlug}`}>
        Back to {conventionName || 'Convention'} Overview
      </BackLink>

      <div className="mt-3 flex flex-col justify-between gap-4 @min-[640px]:flex-row @min-[640px]:items-end">
        <div className="flex items-center gap-3">
          <div className="border-ink bg-accent-soft/25 flex h-11 w-11 shrink-0 items-center justify-center border-2 shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-800">
            <Users className="text-ink h-5 w-5 dark:text-zinc-100" />
          </div>
          <div>
            <h1 className="font-display text-2xl tracking-wide uppercase sm:text-3xl">
              Cosplay Meetups
            </h1>
            <p className="mt-0.5 text-xs text-zinc-600 sm:text-sm dark:text-zinc-300">
              Community & official gatherings, fan photoshoots, and group meetups.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <CopyLinkButton variant="responsive" />
          <Link
            href={`/conventions/${conventionSlug}/meetups/new`}
            title="Post a Meetup"
            aria-label="Post a Meetup"
            className={cn(
              CONBLOCK_PRIMARY,
              'inline-flex h-10 items-center justify-center gap-1.5 px-3 text-xs font-bold whitespace-nowrap uppercase @min-[680px]:gap-2 @min-[680px]:px-5'
            )}
          >
            <Plus className="h-4 w-4" />
            <span>Post a Meetup</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
