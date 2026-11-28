'use client';

import type { ReactNode } from 'react';
import { AlertTriangle, Check, Info } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export type AlertVariant = 'error' | 'success' | 'warning' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<AlertVariant, { container: string; icon: string }> = {
  error: {
    container: 'bg-red-100 text-red-900 dark:bg-red-950/40 dark:text-red-200',
    icon: 'text-red-700 dark:text-red-400',
  },
  success: {
    container: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200',
    icon: 'text-emerald-700 dark:text-emerald-400',
  },
  warning: {
    container: 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
    icon: 'text-amber-700 dark:text-amber-400',
  },
  info: {
    container: 'bg-sky-100 text-sky-900 dark:bg-sky-950/40 dark:text-sky-200',
    icon: 'text-sky-700 dark:text-sky-400',
  },
};

function DefaultIcon({ variant, className }: { variant: AlertVariant; className: string }) {
  switch (variant) {
    case 'success':
      return <Check className={className} />;
    case 'info':
      return <Info className={className} />;
    case 'warning':
    case 'error':
    default:
      return <AlertTriangle className={className} />;
  }
}

export function Alert({ variant = 'error', title, children, icon, className }: AlertProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div
      role="alert"
      className={cn(
        'border-ink flex items-start gap-2.5 border-2 p-3 text-xs shadow-[2px_2px_0_var(--ink)]',
        styles.container,
        className
      )}
    >
      <div className={cn('mt-0.5 shrink-0', styles.icon)}>
        {icon ?? <DefaultIcon variant={variant} className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        {title && (
          <h3 className="font-display mb-1 text-xs font-bold tracking-wider uppercase">{title}</h3>
        )}
        <div className="leading-relaxed font-medium">{children}</div>
      </div>
    </div>
  );
}
