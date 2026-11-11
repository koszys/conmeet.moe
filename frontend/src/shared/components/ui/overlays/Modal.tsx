'use client';

import { useEffect, useId, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { CONBLOCK } from '../actions/Button';
import { cn } from '@/shared/lib/utils';
import { lockBodyScroll } from '@/shared/lib/scrollLock';

const emptySubscribe = () => () => {};

export type ModalMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

const MAX_WIDTH_MAP: Record<ModalMaxWidth, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
};

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  preventClose?: boolean;
  maxWidth?: ModalMaxWidth;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  className?: string;
  overlayClassName?: string;
  children: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  preventClose = false,
  maxWidth = 'md',
  ariaLabel,
  ariaLabelledBy,
  className,
  overlayClassName,
  children,
}: ModalProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !preventClose) {
        onClose();
      }
    }

    const unlock = lockBodyScroll();
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      unlock();
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, preventClose]);

  if (!isMounted || !isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center overscroll-contain bg-black/60 p-4 backdrop-blur-xs sm:p-6',
        overlayClassName
      )}
      onClick={(e) => {
        e.stopPropagation();
        if (!preventClose) onClose();
      }}
    >
      <div
        className={cn(
          'border-ink w-full overscroll-contain border-2 bg-white shadow-[6px_6px_0_var(--ink)] dark:bg-zinc-900',
          MAX_WIDTH_MAP[maxWidth],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export interface ModalHeaderProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  onClose?: () => void;
  closeDisabled?: boolean;
  className?: string;
  titleId?: string;
  children?: React.ReactNode;
}

export function ModalHeader({
  title,
  subtitle,
  onClose,
  closeDisabled = false,
  className,
  titleId,
  children,
}: ModalHeaderProps) {
  const generatedId = useId();
  const headingId = titleId || generatedId;

  return (
    <div
      className={cn(
        'border-ink flex items-center justify-between border-b-2 p-4 sm:px-6',
        className
      )}
    >
      {children || (
        <div className="min-w-0 flex-1">
          {title && (
            <h2
              id={headingId}
              className="font-display truncate text-base tracking-wide uppercase sm:text-lg dark:text-zinc-100"
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-300">{subtitle}</p>
          )}
        </div>
      )}

      {onClose && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          disabled={closeDisabled}
          className={cn(
            CONBLOCK,
            'shrink-0 p-1.5 hover:bg-zinc-200 disabled:opacity-50 dark:hover:bg-zinc-800'
          )}
          title="Close"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export interface ModalBodyProps {
  className?: string;
  children: React.ReactNode;
}

export function ModalBody({ className, children }: ModalBodyProps) {
  return <div className={cn('p-5 sm:p-6', className)}>{children}</div>;
}

export interface ModalFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function ModalFooter({ className, children }: ModalFooterProps) {
  return (
    <div
      className={cn(
        'border-ink flex items-center justify-end gap-2.5 border-t-2 border-dashed p-4 sm:px-6',
        className
      )}
    >
      {children}
    </div>
  );
}
