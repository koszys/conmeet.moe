import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/utils';

export const CONBLOCK =
  'border-ink cursor-pointer border-2 shadow-[2px_2px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none';

export const CONBLOCK_PRIMARY = cn(
  CONBLOCK,
  'bg-accent hover:bg-accent-pop cursor-pointer text-xs font-bold tracking-widest text-white uppercase dark:text-zinc-950 dark:hover:text-white'
);

export const CONBLOCK_ACCENT = cn(
  CONBLOCK,
  'bg-accent-pop hover:brightness-110 cursor-pointer text-xs font-bold tracking-widest text-white uppercase'
);

const BUTTON_SIZES = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
} as const;

export type ButtonSize = keyof typeof BUTTON_SIZES;

const ICON_BUTTON =
  CONBLOCK +
  ' hover:border-accent-pop hover:text-accent-pop inline-flex cursor-pointer items-center justify-center rounded-none text-zinc-900 dark:text-white';

export interface IconButtonProps extends ComponentProps<'button'> {
  size?: ButtonSize;
  ref?: React.Ref<HTMLButtonElement>;
}

export function iconButtonClasses(size: ButtonSize = 'md', extra?: string) {
  return cn(ICON_BUTTON, BUTTON_SIZES[size], extra);
}

export function IconButton({
  size = 'md',
  className,
  type = 'button',
  ref,
  ...props
}: IconButtonProps) {
  return <button ref={ref} type={type} className={iconButtonClasses(size, className)} {...props} />;
}

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
export type ButtonSizeVariant = 'sm' | 'md' | 'lg';

const BUTTON_VARIANT_MAP: Record<ButtonVariant, string> = {
  primary: 'bg-accent hover:bg-accent-pop text-white dark:text-zinc-950 dark:hover:text-white',
  secondary:
    'bg-white hover:bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800',
  accent: 'bg-accent-pop hover:brightness-110 text-white',
  danger: 'bg-rose-600 hover:bg-rose-500 text-white',
  ghost:
    'bg-transparent shadow-none hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100',
};

const BUTTON_SIZE_MAP: Record<ButtonSizeVariant, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-xs',
  lg: 'px-6 py-3 text-sm',
};

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSizeVariant;
  fullWidth?: boolean;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  className,
  type = 'button',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        CONBLOCK,
        'inline-flex items-center justify-center gap-2 font-bold tracking-wider uppercase',
        BUTTON_VARIANT_MAP[variant],
        BUTTON_SIZE_MAP[size],
        fullWidth && 'w-full',
        disabled &&
          'cursor-not-allowed opacity-50 hover:translate-x-0 hover:translate-y-0 hover:shadow-[2px_2px_0_var(--ink)]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
