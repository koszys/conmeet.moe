import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/utils';

export const CONBLOCK =
  'border-ink cursor-pointer border-2 shadow-[2px_2px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none';

export const CONBLOCK_PRIMARY = cn(
  CONBLOCK,
  'bg-accent hover:bg-accent-pop cursor-pointer text-xs font-bold tracking-widest text-white uppercase'
);

const BUTTON_SIZES = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
} as const;

export type ButtonSize = keyof typeof BUTTON_SIZES;

const ICON_BUTTON =
  CONBLOCK +
  ' hover:border-accent-pop hover:text-accent-pop inline-flex cursor-pointer items-center justify-center rounded-none text-zinc-700 dark:text-zinc-200';

export interface IconButtonProps extends ComponentProps<'button'> {
  size?: ButtonSize;
}

export function iconButtonClasses(size: ButtonSize = 'md', extra?: string) {
  return cn(ICON_BUTTON, BUTTON_SIZES[size], extra);
}

export function IconButton({ size = 'md', className, type = 'button', ...props }: IconButtonProps) {
  return <button type={type} className={iconButtonClasses(size, className)} {...props} />;
}
