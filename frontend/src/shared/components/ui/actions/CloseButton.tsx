'use client';

import { X } from 'lucide-react';
import { CONBLOCK } from './Button';
import { cn } from '@/shared/lib/utils';

export interface CloseButtonProps extends Omit<React.ComponentProps<'button'>, 'children'> {
  onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
  title?: string;
  className?: string;
}

const SIZE_MAP = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-10 w-10',
};

const ICON_SIZE_MAP = {
  sm: 'h-4 w-4 stroke-[2.5]',
  md: 'h-5 w-5 stroke-2',
  lg: 'h-5 w-5 stroke-[2.5]',
};

export function CloseButton({
  onClose,
  onClick,
  size = 'sm',
  ariaLabel = 'Close',
  title = 'Close',
  className,
  type = 'button',
  ...props
}: CloseButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onClose) {
      onClose(e);
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      aria-label={ariaLabel}
      title={title}
      className={cn(
        CONBLOCK,
        'flex shrink-0 cursor-pointer items-center justify-center bg-white text-zinc-600 hover:bg-zinc-100 hover:text-black dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white',
        SIZE_MAP[size],
        className
      )}
      {...props}
    >
      <X className={ICON_SIZE_MAP[size]} />
    </button>
  );
}
