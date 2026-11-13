'use client';

import Image from 'next/image';
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';
import mikuGif from './hatsune_miku_gif.gif';

export const MIKU_GIF_SIZES = {
  xs: 32,
  sm: 48,
  md: 80,
  lg: 128,
  xl: 180,
} as const;

export type MikuGifSize = keyof typeof MIKU_GIF_SIZES;

export type MikuGifVariant = 'framed' | 'frameless' | 'circle';

export type MikuSpeechPosition = 'top' | 'right' | 'bottom';

export interface MikuGifProps {
  /** Size preset ('xs' | 'sm' | 'md' | 'lg' | 'xl') or custom pixel dimension */
  size?: MikuGifSize | number;
  /** Frame appearance style */
  variant?: MikuGifVariant;
  /** Optional speech bubble / quote message */
  speech?: ReactNode;
  /** Speech bubble placement relative to Miku (default: 'top') */
  speechPosition?: MikuSpeechPosition;
  /** Custom speech bubble class name */
  speechClassName?: string;
  /** Accessible alt text */
  alt?: string;
  /** High priority preload flag */
  priority?: boolean;
  /** Click handler for mascot interactions */
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  /** Outer container class name */
  className?: string;
  /** Image class name */
  imageClassName?: string;
}

export function MikuGif({
  size = 'md',
  variant = 'frameless',
  speech,
  speechPosition = 'top',
  speechClassName,
  alt = 'Hatsune Miku mascot',
  priority = false,
  onClick,
  className,
  imageClassName,
}: MikuGifProps) {
  const pixelSize = typeof size === 'number' ? size : (MIKU_GIF_SIZES[size] ?? MIKU_GIF_SIZES.md);
  const isInteractive = typeof onClick === 'function';

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e as unknown as MouseEvent<HTMLDivElement>);
    }
  };

  const bubbleNode = speech ? (
    <div
      className={cn(
        'border-ink text-ink animate-bubble-pop relative z-10 max-w-xs border-2 bg-white px-2.5 py-1 text-center text-xs font-bold tracking-wider uppercase shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-900 dark:text-zinc-100',
        speechClassName
      )}
    >
      {speech}
      {speechPosition === 'top' && (
        <span
          aria-hidden="true"
          className="border-ink absolute -bottom-1.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-r-2 border-b-2 bg-white dark:bg-zinc-900"
        />
      )}
      {speechPosition === 'bottom' && (
        <span
          aria-hidden="true"
          className="border-ink absolute -top-1.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-t-2 border-l-2 bg-white dark:bg-zinc-900"
        />
      )}
      {speechPosition === 'right' && (
        <span
          aria-hidden="true"
          className="border-ink absolute top-1/2 -left-1.5 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-b-2 border-l-2 bg-white dark:bg-zinc-900"
        />
      )}
    </div>
  ) : null;

  const mascotFrame = (
    <div
      className={cn(
        'inline-flex items-center justify-center transition-transform',
        variant === 'framed' &&
          'border-ink border-2 bg-white p-1 shadow-[3px_3px_0_var(--ink)] dark:bg-zinc-900',
        variant === 'circle' &&
          'border-ink overflow-hidden rounded-full border-2 bg-white shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-900',
        isInteractive && 'cursor-pointer hover:scale-105 active:scale-95'
      )}
      style={{ width: pixelSize, height: pixelSize }}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={isInteractive ? alt : undefined}
    >
      <Image
        src={mikuGif}
        alt={alt}
        width={pixelSize}
        height={pixelSize}
        unoptimized
        priority={priority}
        className={cn(
          'pointer-events-none h-full w-full object-contain select-none',
          imageClassName
        )}
      />
    </div>
  );

  if (!speech) {
    return (
      <div className={cn('inline-flex items-center justify-center', className)}>{mascotFrame}</div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center',
        speechPosition === 'top' && 'flex-col gap-2',
        speechPosition === 'bottom' && 'flex-col gap-2',
        speechPosition === 'right' && 'flex-row gap-3',
        className
      )}
    >
      {speechPosition === 'top' && (
        <>
          {bubbleNode}
          {mascotFrame}
        </>
      )}
      {speechPosition === 'bottom' && (
        <>
          {mascotFrame}
          {bubbleNode}
        </>
      )}
      {speechPosition === 'right' && (
        <>
          {mascotFrame}
          {bubbleNode}
        </>
      )}
    </div>
  );
}
