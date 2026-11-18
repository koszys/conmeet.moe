'use client';

import { Undo2 } from 'lucide-react';
import { CONBLOCK_SECONDARY } from './Button';
import { cn } from '@/shared/lib/utils';

export interface UndoButtonProps extends Omit<React.ComponentProps<'button'>, 'children'> {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  label?: string;
  size?: 'xs' | 'sm';
  title?: string;
  ariaLabel?: string;
  className?: string;
}

export function UndoButton({
  onClick,
  label = 'Undo',
  size = 'sm',
  title = 'Undo',
  ariaLabel = 'Undo',
  className,
  disabled = false,
  type = 'button',
  ...props
}: UndoButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={cn(
        CONBLOCK_SECONDARY,
        'font-display inline-flex items-center gap-1 font-bold tracking-wider uppercase select-none',
        size === 'xs' && 'px-2 py-0.5 text-[10px]',
        size === 'sm' && 'px-2.5 py-1 text-xs',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      {...props}
    >
      <Undo2 className={cn(size === 'xs' ? 'h-3 w-3' : 'h-3.5 w-3.5', 'shrink-0')} />
      <span>{label}</span>
    </button>
  );
}
