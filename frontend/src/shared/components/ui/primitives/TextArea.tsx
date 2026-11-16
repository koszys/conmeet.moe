'use client';

import { forwardRef } from 'react';
import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/shared/lib/utils';

export interface TextAreaProps extends ComponentPropsWithRef<'textarea'> {
  error?: string | boolean;
  minHeight?: string;
}

function getMinHeightClass(rows?: number, customMinHeight?: string) {
  if (customMinHeight) return customMinHeight;
  switch (rows) {
    case 2:
      return 'min-h-20'; // ~80px
    case 3:
      return 'min-h-24'; // ~96px
    case 4:
      return 'min-h-28'; // ~112px
    case 5:
      return 'min-h-36'; // ~144px
    default:
      return rows && rows > 5 ? 'min-h-40' : 'min-h-24';
  }
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { rows = 3, minHeight, error, className, disabled, ...props },
  ref
) {
  const minHeightClass = getMinHeightClass(rows, minHeight);

  return (
    <textarea
      ref={ref}
      rows={rows}
      disabled={disabled}
      className={cn(
        'border-ink focus:ring-accent w-full resize-y border-2 bg-white p-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-300',
        minHeightClass,
        error && 'border-red-500 focus:ring-red-500 dark:border-red-500',
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
      {...props}
    />
  );
});
