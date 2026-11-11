'use client';

import { Check, Users } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { CONBLOCK } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';
import { useToggleGoingMeetup } from '../api';
import type { Meetup } from '../types';

export interface GoingButtonProps extends Omit<
  React.ComponentProps<'button'>,
  'children' | 'onClick'
> {
  /** Optional Meetup object to populate ID, isGoing, and goingCount */
  meetup?: Pick<Meetup, 'id' | 'is_going' | 'going_count'>;
  /** Meetup ID for auto-mutation when meetup object is omitted */
  meetupId?: number;
  /** Whether the current user is attending */
  isGoing?: boolean;
  /** Attendee headcount count */
  goingCount?: number;
  /** Convention slug for auth redirect if user is unauthenticated */
  conventionSlug?: string;
  /** Optional explicit redirect URL on unauthenticated click */
  redirectUrl?: string;
  /** Custom click handler (overrides internal mutation if provided) */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Size variant:
   * 'sm': Compact card footer size (h-8, px-2.5, text-xs)
   * 'md': Detail view size (h-10, px-4 sm:px-5, text-xs)
   * 'responsive': Compact on mobile, standard on desktop
   */
  size?: 'sm' | 'md' | 'responsive';
  /** Text label when user is going (default: "I'm Going!") */
  goingLabel?: string;
  /** Text label when user is not going (default: "Going!") */
  notGoingLabel?: string;
  /** Custom title attribute */
  title?: string;
  /** Custom aria-label attribute */
  ariaLabel?: string;
  /** Additional CSS class names */
  className?: string;
}

export function GoingButton({
  meetup,
  meetupId,
  isGoing,
  goingCount,
  conventionSlug,
  redirectUrl,
  onClick,
  size = 'sm',
  goingLabel = "I'm Going!",
  notGoingLabel = 'Going!',
  title,
  ariaLabel,
  className,
  disabled,
  type = 'button',
  ...props
}: GoingButtonProps) {
  const { user } = useAuth();
  const toggleGoing = useToggleGoingMeetup();

  const activeIsGoing = isGoing ?? meetup?.is_going ?? false;
  const activeCount = goingCount ?? meetup?.going_count ?? 0;
  const activeMeetupId = meetupId ?? meetup?.id;

  const defaultTitle = activeIsGoing ? "Cancel I'm Going" : "I'm Going!";
  const defaultAria = activeIsGoing ? "Cancel I'm Going" : "I'm Going!";

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (onClick) {
      onClick(e);
      return;
    }

    if (!activeMeetupId) return;

    if (!user) {
      const fallbackRedirect = conventionSlug
        ? `/conventions/${conventionSlug}/meetups/${activeMeetupId}`
        : '/login';
      const destination = redirectUrl || fallbackRedirect;
      window.location.href = `/login?redirect=${encodeURIComponent(destination)}`;
      return;
    }

    toggleGoing.mutate(activeMeetupId);
  };

  const isPending = disabled || toggleGoing.isPending;

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={isPending}
      title={title || defaultTitle}
      aria-label={ariaLabel || defaultAria}
      aria-pressed={activeIsGoing}
      className={cn(
        CONBLOCK,
        'pointer-events-auto relative z-10 inline-flex items-center font-bold tracking-wide uppercase transition-all select-none',
        size === 'sm' && 'h-8 gap-1.5 px-2.5 text-xs',
        size === 'md' && 'h-10 gap-2 px-4 py-2 text-xs sm:px-5',
        size === 'responsive' && 'h-8 gap-1.5 px-2.5 text-xs sm:h-10 sm:gap-2 sm:px-4',
        activeIsGoing
          ? 'bg-accent text-white hover:brightness-105 active:brightness-95 dark:text-zinc-950'
          : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100 hover:text-black dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-white',
        isPending && 'cursor-not-allowed opacity-60',
        className
      )}
      {...props}
    >
      {activeIsGoing ? (
        <Check
          className={cn(
            'shrink-0 stroke-[2.5]',
            size === 'sm' && 'h-3.5 w-3.5',
            size === 'md' && 'h-4 w-4',
            size === 'responsive' && 'h-3.5 w-3.5 sm:h-4 sm:w-4'
          )}
        />
      ) : (
        <Users
          className={cn(
            'shrink-0 stroke-2',
            size === 'sm' && 'h-3.5 w-3.5',
            size === 'md' && 'h-4 w-4',
            size === 'responsive' && 'h-3.5 w-3.5 sm:h-4 sm:w-4'
          )}
        />
      )}

      <span>{activeIsGoing ? goingLabel : notGoingLabel}</span>

      <span
        className={cn(
          'ml-1 inline-flex items-center justify-center rounded-[2px] px-1.5 py-0.5 font-mono text-[10px] leading-none font-bold',
          activeIsGoing
            ? 'border border-white/40 bg-white/20 text-white dark:border-black/30 dark:bg-black/20 dark:text-zinc-950'
            : 'border-ink/20 border bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
        )}
      >
        {activeCount}
      </span>
    </button>
  );
}

// Convenient alias for domain clarity
export const MeetupGoingButton = GoingButton;
