'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { CONBLOCK } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import type { Freebie } from '../types';
import { useDeleteFreebie } from '../api/mutations';

interface DeleteFreebieModalProps {
  freebie: Freebie;
  isOpen: boolean;
  onClose: () => void;
}

const emptySubscribe = () => () => {};

export function DeleteFreebieModal({ freebie, isOpen, onClose }: DeleteFreebieModalProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const deleteMutation = useDeleteFreebie();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !deleteMutation.isPending) {
        onClose();
      }
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, deleteMutation.isPending]);

  if (!isMounted || !isOpen) return null;

  async function handleDelete() {
    setError(null);
    try {
      await deleteMutation.mutateAsync(freebie.id);
      onClose();
    } catch {
      setError('Failed to delete freebie. Please try again.');
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-freebie-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={() => {
        if (!deleteMutation.isPending) onClose();
      }}
    >
      <div
        className="border-ink w-full max-w-md border-2 bg-white p-5 shadow-[6px_6px_0_var(--ink)] sm:p-6 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <div className="border-ink flex h-10 w-10 shrink-0 items-center justify-center border-2 bg-rose-100 text-rose-600 shadow-[2px_2px_0_var(--ink)] dark:bg-rose-950 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5 stroke-2" />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="delete-freebie-title"
              className="font-display text-base tracking-wide text-zinc-900 uppercase sm:text-lg dark:text-zinc-100"
            >
              Delete Freebie Drop?
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
              Are you sure you want to delete{' '}
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                &ldquo;{freebie.name}&rdquo;
              </span>
              ? This action cannot be undone and will permanently remove this drop from all
              users&rsquo; saved checklists.
            </p>
          </div>
        </div>

        {error ? (
          <div className="border-ink mt-4 border-2 bg-rose-50 p-3 text-xs font-bold text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className={cn(CONBLOCK, 'px-4 py-2 text-xs font-bold uppercase')}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className={cn(
              CONBLOCK,
              'border-ink inline-flex items-center gap-1.5 border-2 bg-rose-600 px-4 py-2 text-xs font-bold text-white uppercase shadow-[3px_3px_0_var(--ink)] transition-all hover:bg-rose-700 disabled:opacity-50'
            )}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                Delete Drop
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
