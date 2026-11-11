'use client';

import { Check, Square } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { CONBLOCK } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';
import { useToggleClaimFreebie } from '../api/mutations';
import type { Freebie } from '../types';

export interface ClaimButtonProps extends Omit<
  React.ComponentProps<'button'>,
  'children' | 'onClick'
> {
  /** Optional Freebie object to populate ID and isClaimed */
  freebie?: Pick<Freebie, 'id' | 'is_claimed'>;
  /** Freebie ID for auto-mutation when freebie object is omitted */
  freebieId?: number;
  /** Whether the current item is claimed */
  isClaimed?: boolean;
  /** Convention slug for auth redirect if user is unauthenticated */
  conventionSlug?: string;
  /** Optional explicit redirect URL on unauthenticated click */
  redirectUrl?: string;
  /** Custom click handler (overrides internal mutation if provided) */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Button display variant:
   * 'button': Expanded button with text label and icon (default for cards)
   * 'icon': Compact square icon button (default for modals)
   * 'responsive': Icon button on mobile, text button on sm+
   */
  variant?: 'button' | 'icon' | 'responsive';
  /** Text label when item is claimed (default: "CLAIMED") */
  claimedLabel?: string;
  /** Text label when item is unclaimed (default: "CHECK OFF") */
  unclaimedLabel?: string;
  /** Custom title attribute */
  title?: string;
  /** Custom aria-label attribute */
  ariaLabel?: string;
  /** Additional CSS class names */
  className?: string;
}

export function ClaimButton({
  freebie,
  freebieId,
  isClaimed,
  conventionSlug,
  redirectUrl,
  onClick,
  variant = 'button',
  claimedLabel = 'CLAIMED',
  unclaimedLabel = 'CHECK OFF',
  title,
  ariaLabel,
  className,
  disabled,
  type = 'button',
  ...props
}: ClaimButtonProps) {
  const { user } = useAuth();
  const toggleClaim = useToggleClaimFreebie();

  const activeIsClaimed = isClaimed ?? freebie?.is_claimed ?? false;
  const activeFreebieId = freebieId ?? freebie?.id;

  const defaultTitle = activeIsClaimed ? 'Claimed (click to unclaim)' : 'Check off freebie';
  const defaultAria = activeIsClaimed ? 'Claimed' : 'Check off freebie';

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (onClick) {
      onClick(e);
      return;
    }

    if (!activeFreebieId) return;

    if (!user) {
      const fallbackRedirect = conventionSlug
        ? `/conventions/${conventionSlug}/freebies`
        : '/login';
      const destination = redirectUrl || fallbackRedirect;
      window.location.href = `/login?redirect=${encodeURIComponent(destination)}`;
      return;
    }

    toggleClaim.mutate(activeFreebieId);
  };

  const isPending = disabled || toggleClaim.isPending;

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={isPending}
      title={title || defaultTitle}
      aria-label={ariaLabel || defaultAria}
      aria-pressed={activeIsClaimed}
      className={cn(
        CONBLOCK,
        'font-bold uppercase transition-all select-none',
        variant === 'button' &&
          'inline-flex flex-1 items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs',
        variant === 'icon' && 'inline-flex h-8 w-8 shrink-0 items-center justify-center',
        variant === 'responsive' &&
          'inline-flex h-8 w-8 shrink-0 items-center justify-center sm:h-auto sm:w-auto sm:flex-1 sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-xs',
        activeIsClaimed
          ? 'bg-accent text-white hover:brightness-110 dark:text-zinc-950'
          : 'bg-white text-zinc-800 hover:bg-zinc-100 hover:text-black dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white',
        isPending && 'cursor-not-allowed opacity-60',
        className
      )}
      {...props}
    >
      {activeIsClaimed ? (
        <Check
          className={cn('shrink-0 stroke-[3]', variant === 'icon' ? 'h-4 w-4' : 'h-3.5 w-3.5')}
        />
      ) : (
        <Square
          className={cn('shrink-0 stroke-2', variant === 'icon' ? 'h-4 w-4' : 'h-3.5 w-3.5')}
        />
      )}

      {variant === 'button' && <span>{activeIsClaimed ? claimedLabel : unclaimedLabel}</span>}
      {variant === 'responsive' && (
        <span className="hidden sm:inline">{activeIsClaimed ? claimedLabel : unclaimedLabel}</span>
      )}
    </button>
  );
}

// Convenient alias for domain clarity
export const FreebieClaimButton = ClaimButton;
