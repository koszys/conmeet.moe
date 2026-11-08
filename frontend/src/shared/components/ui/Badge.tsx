import type { ComponentProps, ComponentType, ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

export type BadgeVariant =
  'default' | 'accent' | 'pop' | 'success' | 'warning' | 'danger' | 'outline';

export type BadgeSize = 'sm' | 'md';

const VARIANT_MAP: Record<BadgeVariant, string> = {
  default: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
  accent: 'bg-accent text-white dark:text-zinc-950',
  pop: 'bg-accent-pop text-white',
  success: 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-zinc-950',
  warning: 'bg-amber-400 text-zinc-950',
  danger: 'bg-rose-600 text-white',
  outline: 'bg-transparent text-zinc-800 dark:text-zinc-200',
};

const SIZE_MAP: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

export interface BadgeProps extends ComponentProps<'span'> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: ComponentType<{ className?: string }>;
  children: ReactNode;
}

export function Badge({
  variant = 'default',
  size = 'sm',
  dot = false,
  icon: Icon,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'border-ink inline-flex items-center gap-1.5 border font-bold tracking-wider uppercase shadow-[1px_1px_0_var(--ink)] select-none',
        VARIANT_MAP[variant],
        SIZE_MAP[size],
        className
      )}
      {...props}
    >
      {dot && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />}
      {Icon && <Icon className="h-3 w-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}
