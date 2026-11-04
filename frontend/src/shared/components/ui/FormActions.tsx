'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Loader2, Sparkles } from 'lucide-react';
import { CONBLOCK, CONBLOCK_PRIMARY } from './button';
import { cn } from '@/shared/lib/utils';

export interface FormActionsProps {
  cancelHref?: string;
  onCancel?: () => void;
  cancelLabel?: string;
  submitLabel?: ReactNode;
  submittingLabel?: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  submitIcon?: ReactNode;
  borderTop?: boolean;
  className?: string;
}

export function FormActions({
  cancelHref,
  onCancel,
  cancelLabel = 'Cancel',
  submitLabel = 'Submit',
  submittingLabel = 'Submitting...',
  isSubmitting = false,
  submitDisabled = false,
  submitIcon = <Sparkles className="h-4 w-4" />,
  borderTop = false,
  className,
}: FormActionsProps) {
  const isSubmitDisabled = submitDisabled || isSubmitting;

  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3',
        borderTop && 'border-ink border-t-2 pt-5',
        className
      )}
    >
      {cancelHref ? (
        <Link
          href={cancelHref}
          className={cn(
            CONBLOCK,
            'bg-white px-5 py-2.5 text-xs font-bold tracking-wider uppercase dark:bg-zinc-800'
          )}
        >
          {cancelLabel}
        </Link>
      ) : onCancel ? (
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className={cn(
            CONBLOCK,
            'bg-white px-5 py-2.5 text-xs font-bold tracking-wider uppercase disabled:opacity-50 dark:bg-zinc-800'
          )}
        >
          {cancelLabel}
        </button>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitDisabled}
        className={cn(
          CONBLOCK_PRIMARY,
          'inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold tracking-wider uppercase disabled:cursor-not-allowed disabled:opacity-50'
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{submittingLabel}</span>
          </>
        ) : (
          <>
            {submitIcon}
            <span>{submitLabel}</span>
          </>
        )}
      </button>
    </div>
  );
}
