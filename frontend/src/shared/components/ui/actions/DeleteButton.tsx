'use client';

import { Trash2 } from 'lucide-react';
import { CONBLOCK } from './Button';
import { cn } from '@/shared/lib/utils';

export interface DeleteButtonProps extends Omit<React.ComponentProps<'button'>, 'children'> {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'icon' | 'button' | 'responsive';
  colorStyle?: 'danger-solid' | 'danger-subtle';
  label?: string;
  title?: string;
  ariaLabel?: string;
  className?: string;
}

export function DeleteButton({
  onClick,
  variant = 'icon',
  colorStyle = 'danger-subtle',
  label = 'Delete',
  title = 'Delete',
  ariaLabel = 'Delete',
  className,
  disabled = false,
  type = 'button',
  ...props
}: DeleteButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={cn(
        CONBLOCK,
        'font-bold uppercase transition-all select-none',
        colorStyle === 'danger-subtle' &&
          'bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:bg-zinc-900 dark:text-rose-400 dark:hover:bg-rose-950/30',
        colorStyle === 'danger-solid' && 'bg-rose-600 text-white hover:bg-rose-500',
        variant === 'icon' && 'inline-flex h-8 w-8 shrink-0 items-center justify-center',
        variant === 'button' && 'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs',
        variant === 'responsive' &&
          'inline-flex h-8 w-8 shrink-0 items-center justify-center sm:h-auto sm:w-auto sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      {...props}
    >
      <Trash2 className="h-3.5 w-3.5 shrink-0" />
      {variant === 'button' && <span>{label}</span>}
      {variant === 'responsive' && <span className="hidden sm:inline">{label}</span>}
    </button>
  );
}
