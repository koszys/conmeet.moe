import type { ComponentType, ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

export interface EmptyStateProps {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  shadow?: boolean;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  shadow = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border-ink flex flex-col items-center justify-center border-2 border-dashed bg-white p-8 text-center sm:p-12 dark:bg-zinc-900',
        shadow && 'shadow-[4px_4px_0_var(--ink)]',
        className
      )}
    >
      {Icon && (
        <div className="border-ink flex h-12 w-12 items-center justify-center border-2 bg-zinc-100 shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-800">
          <Icon className="h-6 w-6 text-zinc-600 dark:text-zinc-300" />
        </div>
      )}

      <h3
        className={cn(
          'font-display font-bold tracking-wider text-zinc-900 uppercase dark:text-zinc-100',
          Icon ? 'mt-4 text-sm' : 'text-sm'
        )}
      >
        {title}
      </h3>

      {description && (
        <div className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
          {description}
        </div>
      )}

      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
