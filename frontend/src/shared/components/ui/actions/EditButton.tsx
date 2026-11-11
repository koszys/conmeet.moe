'use client';

import { Pencil } from 'lucide-react';
import { CONBLOCK } from './Button';
import { cn } from '@/shared/lib/utils';

export interface EditButtonProps extends Omit<React.ComponentProps<'button'>, 'children'> {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'icon' | 'button' | 'responsive';
  label?: string;
  title?: string;
  ariaLabel?: string;
  className?: string;
}

export function EditButton({
  onClick,
  variant = 'icon',
  label = 'Edit',
  title = 'Edit',
  ariaLabel = 'Edit',
  className,
  disabled = false,
  type = 'button',
  ...props
}: EditButtonProps) {
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
        'bg-white text-zinc-800 hover:bg-zinc-100 hover:text-black dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-white',
        variant === 'icon' && 'inline-flex h-8 w-8 shrink-0 items-center justify-center',
        variant === 'button' && 'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs',
        variant === 'responsive' &&
          'inline-flex h-8 w-8 shrink-0 items-center justify-center sm:h-auto sm:w-auto sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      {...props}
    >
      <Pencil className="h-3.5 w-3.5 shrink-0" />
      {variant === 'button' && <span>{label}</span>}
      {variant === 'responsive' && <span className="hidden sm:inline">{label}</span>}
    </button>
  );
}
