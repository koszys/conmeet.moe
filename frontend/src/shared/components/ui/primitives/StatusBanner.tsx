'use client';

import { useEffect } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface StatusBannerProps {
  variant?: 'success' | 'error';
  message?: string | null;
  autoDismissMs?: number;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Reusable neo-brutalist status banner for inline success and error feedback,
 * with optional auto-dismissal.
 */
export function StatusBanner({
  variant = 'success',
  message,
  autoDismissMs,
  onDismiss,
  className,
}: StatusBannerProps) {
  useEffect(() => {
    if (!message || !autoDismissMs || !onDismiss) return;
    const timer = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(timer);
  }, [message, autoDismissMs, onDismiss]);

  if (!message) return null;

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'border-ink mt-4 flex items-center gap-2 border-2 p-3 text-xs font-bold shadow-[2px_2px_0_var(--ink)]',
        variant === 'success'
          ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
          : 'bg-red-100 text-red-900 dark:bg-red-950/40 dark:text-red-200',
        className
      )}
    >
      {variant === 'success' ? (
        <Check className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
      ) : (
        <AlertTriangle className="h-4 w-4 shrink-0 text-red-700 dark:text-red-400" />
      )}
      <span>{message}</span>
    </div>
  );
}
