'use client';

import { Bookmark } from 'lucide-react';
import { CONBLOCK } from './button';
import { cn } from '@/shared/lib/utils';

export interface BookmarkButtonProps {
  isSaved: boolean;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  title?: string;
  ariaLabel?: string;
  variant?: 'icon' | 'button' | 'responsive';
  savedLabel?: string;
  unsavedLabel?: string;
  className?: string;
}

export function BookmarkButton({
  isSaved,
  onClick,
  disabled = false,
  title,
  ariaLabel,
  variant = 'icon',
  savedLabel = 'Saved',
  unsavedLabel = 'Save',
  className,
}: BookmarkButtonProps) {
  const defaultTitle = isSaved ? 'Remove from saved' : 'Save';
  const defaultAria = isSaved ? 'Remove from saved' : 'Save';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title || defaultTitle}
      aria-label={ariaLabel || defaultAria}
      className={cn(
        CONBLOCK,
        'font-bold uppercase transition-all',
        isSaved
          ? 'bg-accent-pop text-white hover:brightness-110'
          : 'bg-white text-zinc-800 hover:bg-zinc-100 hover:text-black dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white',
        variant === 'icon' && 'inline-flex h-8 w-8 shrink-0 items-center justify-center',
        variant === 'button' && 'inline-flex items-center gap-2 px-5 py-2.5 text-xs',
        variant === 'responsive' &&
          'inline-flex h-10 w-10 shrink-0 items-center justify-center p-0 text-xs sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2.5',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <Bookmark
        className={cn('h-4 w-4 shrink-0', isSaved ? 'fill-current stroke-2' : 'stroke-2')}
      />
      {variant === 'button' && <span>{isSaved ? savedLabel : unsavedLabel}</span>}
      {variant === 'responsive' && (
        <span className="hidden sm:inline">{isSaved ? savedLabel : unsavedLabel}</span>
      )}
    </button>
  );
}
