'use client';

import { Heart } from 'lucide-react';
import { CONBLOCK_ACCENT, CONBLOCK_SECONDARY } from './Button';
import { cn } from '@/shared/lib/utils';

export interface LikeButtonProps {
  isLiked: boolean;
  count?: number;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  title?: string;
  ariaLabel?: string;
  variant?: 'icon' | 'badge' | 'button' | 'responsive';
  className?: string;
}

export function LikeButton({
  isLiked,
  count,
  onClick,
  disabled = false,
  title,
  ariaLabel,
  variant = 'badge',
  className,
}: LikeButtonProps) {
  const defaultTitle = isLiked ? 'Unlike' : 'Like';
  const defaultAria = isLiked ? 'Unlike' : 'Like';

  const activeStyles = CONBLOCK_ACCENT;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title || defaultTitle}
      aria-label={ariaLabel || defaultAria}
      className={cn(
        'cursor-pointer font-bold transition-all',
        isLiked ? activeStyles : CONBLOCK_SECONDARY,
        variant === 'icon' && 'inline-flex h-8 w-8 shrink-0 items-center justify-center',
        variant === 'badge' && 'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs',
        variant === 'button' && 'inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase',
        variant === 'responsive' &&
          'inline-flex h-10 w-10 shrink-0 items-center justify-center p-0 text-xs sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2.5 sm:uppercase',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <Heart
        className={cn(
          'h-4 w-4 shrink-0 transition-transform active:scale-125',
          isLiked ? 'fill-current stroke-2 text-white' : 'stroke-2'
        )}
      />
      {typeof count === 'number' && <span className="font-mono text-xs tabular-nums">{count}</span>}
      {variant === 'button' && <span>{isLiked ? 'Liked' : 'Like'}</span>}
      {variant === 'responsive' && (
        <span className="hidden sm:inline">{isLiked ? 'Liked' : 'Like'}</span>
      )}
    </button>
  );
}
