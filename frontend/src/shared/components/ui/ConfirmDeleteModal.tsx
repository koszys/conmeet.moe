'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { CONBLOCK } from './button';
import { cn } from '@/shared/lib/utils';

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  itemName: string;
  itemType?: string;
  title?: string;
  warningMessage?: string;
  confirmText?: string;
  isPending?: boolean;
  error?: string | null;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = 'Item',
  title,
  warningMessage,
  confirmText,
  isPending = false,
  error: controlledError,
}: ConfirmDeleteModalProps) {
  const [internalError, setInternalError] = useState<string | null>(null);
  const [internalPending, setInternalPending] = useState(false);

  const pending = isPending || internalPending;
  const displayError = controlledError !== undefined ? controlledError : internalError;

  async function handleConfirm() {
    setInternalError(null);
    setInternalPending(true);
    try {
      await onConfirm();
    } catch {
      setInternalError(`Failed to delete ${itemType.toLowerCase()}. Please try again.`);
    } finally {
      setInternalPending(false);
    }
  }

  const heading = title || `Delete ${itemType}?`;
  const defaultWarning = (
    <>
      Are you sure you want to delete{' '}
      <span className="font-bold text-zinc-900 dark:text-zinc-100">&ldquo;{itemName}&rdquo;</span>?
      This action cannot be undone and will permanently remove this {itemType.toLowerCase()}.
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      preventClose={pending}
      maxWidth="md"
      ariaLabel={heading}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3.5">
          <div className="border-ink flex h-10 w-10 shrink-0 items-center justify-center border-2 bg-rose-100 text-rose-600 shadow-[2px_2px_0_var(--ink)] dark:bg-rose-950 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5 stroke-2" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-display text-base tracking-wide text-zinc-900 uppercase sm:text-lg dark:text-zinc-100">
              {heading}
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
              {warningMessage || defaultWarning}
            </p>
          </div>
        </div>

        {displayError ? (
          <div className="border-ink mt-4 border-2 bg-rose-50 p-3 text-xs font-bold text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
            {displayError}
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className={cn(CONBLOCK, 'px-4 py-2 text-xs font-bold uppercase')}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={pending}
            className={cn(
              CONBLOCK,
              'border-ink inline-flex items-center gap-1.5 border-2 bg-rose-600 px-4 py-2 text-xs font-bold text-white uppercase shadow-[3px_3px_0_var(--ink)] transition-all hover:bg-rose-700 disabled:opacity-50'
            )}
          >
            {pending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                {confirmText || `Delete ${itemType}`}
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
