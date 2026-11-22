'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Loader2, MessageSquarePlus } from 'lucide-react';
import { useAuth } from '@/features/auth';
import {
  CONBLOCK_PRIMARY,
  CONBLOCK_SECONDARY,
  CharCounter,
  TextArea,
} from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';

export interface CommentFormProps {
  onSubmit: (body: string) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  placeholder?: string;
  submitLabel?: string;
  autoFocus?: boolean;
  className?: string;
}

const MAX_COMMENT_LENGTH = 500;

export function CommentForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  placeholder = 'Write a comment... (max 500 characters)',
  submitLabel = 'Post Comment',
  autoFocus = false,
  className,
}: CommentFormProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <div
        className={cn(
          'border-ink bg-surface shadow-neo flex flex-col items-start justify-between gap-4 border-2 p-4 sm:flex-row sm:items-center sm:p-5',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="border-ink bg-accent/20 dark:bg-accent/30 flex h-10 w-10 shrink-0 items-center justify-center border-2">
            <MessageSquarePlus className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
          </div>
          <div>
            <h4 className="font-display text-sm font-bold tracking-wide uppercase">
              Join the conversation
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              Sign in to share your thoughts, ask questions, or reply.
            </p>
          </div>
        </div>

        <Link
          href={`/login?redirect=${encodeURIComponent(pathname || '/')}`}
          className={cn(
            CONBLOCK_PRIMARY,
            'inline-flex items-center px-4 py-2 text-xs font-bold tracking-wider whitespace-nowrap uppercase'
          )}
        >
          Sign In to Comment
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) {
      setError('Comment cannot be empty.');
      return;
    }
    if (trimmed.length > MAX_COMMENT_LENGTH) {
      setError(`Comment exceeds maximum limit of ${MAX_COMMENT_LENGTH} characters.`);
      return;
    }

    setError(null);
    try {
      await onSubmit(trimmed);
      setBody('');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to post comment. Please try again.';
      setError(message);
    }
  };

  const isOverLimit = body.length > MAX_COMMENT_LENGTH;
  const isSubmitDisabled = !body.trim() || isOverLimit || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className={cn('max-w-full min-w-0 space-y-2', className)}>
      <div className="relative">
        <TextArea
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            if (error) setError(null);
          }}
          placeholder={placeholder}
          rows={3}
          maxLength={MAX_COMMENT_LENGTH + 50} // slight buffer so user sees warning if pasting too much
          autoFocus={autoFocus}
          disabled={isSubmitting}
          error={Boolean(error || isOverLimit)}
          className="text-sm"
        />
      </div>

      {error && <p className="text-xs font-bold text-rose-500 dark:text-rose-400">{error}</p>}

      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 sm:gap-2">
        <CharCounter current={body.length} max={MAX_COMMENT_LENGTH} />

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className={cn(
                CONBLOCK_SECONDARY,
                'shrink-0 px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase sm:px-3 sm:py-1.5 sm:text-xs'
              )}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={cn(
              CONBLOCK_PRIMARY,
              'inline-flex shrink-0 items-center gap-1 px-3 py-1 text-[11px] font-bold tracking-wider uppercase disabled:opacity-50 sm:gap-1.5 sm:px-4 sm:py-1.5 sm:text-xs'
            )}
          >
            {isSubmitting && <Loader2 className="h-3 w-3 animate-spin sm:h-3.5 sm:w-3.5" />}
            <span>{submitLabel}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
