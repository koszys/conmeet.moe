'use client';

import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';
import { CharCounter } from './CharCounter';

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  count?: number;
  maxCount?: number;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  count,
  maxCount,
  error,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        <label htmlFor={htmlFor} className="font-display block text-xs tracking-wider uppercase">
          {label}
        </label>
        {count !== undefined && maxCount !== undefined && (
          <CharCounter current={count} max={maxCount} />
        )}
      </div>

      <div className="mt-1.5">{children}</div>

      {error ? (
        <p className="mt-1 text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">{hint}</p>
      ) : null}
    </div>
  );
}
