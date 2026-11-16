'use client';

import { forwardRef } from 'react';
import type { ComponentPropsWithRef, ComponentType } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface TextInputProps extends ComponentPropsWithRef<'input'> {
  value?: string;
  onClear?: () => void;
  clearable?: boolean;
  icon?: ComponentType<{ className?: string }>;
  error?: string | boolean;
  wrapperClassName?: string;
  inputSize?: 'sm' | 'md' | 'lg';
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    value,
    onChange,
    onClear,
    clearable = true,
    icon: Icon,
    error,
    inputSize = 'md',
    placeholder,
    className,
    wrapperClassName,
    disabled,
    ...props
  },
  ref
) {
  const showClear = Boolean(clearable && value && onClear && !disabled);

  const sizeClasses =
    inputSize === 'sm'
      ? 'h-9 text-xs pl-2.5 sm:pl-3'
      : inputSize === 'lg'
        ? 'h-11 sm:h-12 text-sm sm:text-base pl-3 sm:pl-3.5'
        : 'h-9.5 sm:h-11 text-xs sm:text-sm pl-2.5 sm:pl-3'; // 'md' default matching VendorPicker

  return (
    <div className={cn('relative w-full', wrapperClassName)}>
      {Icon && (
        <Icon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-300" />
      )}
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'border-ink focus:border-accent-pop w-full border-2 bg-white font-medium text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-300',
          sizeClasses,
          Icon && '!pl-9',
          showClear ? 'pr-9' : 'pr-2.5 sm:pr-3',
          error ? 'focus:border-accent-pop border-red-500 dark:border-red-500' : '',
          disabled && 'cursor-not-allowed opacity-60',
          className
        )}
        {...props}
      />
      {showClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
          title="Clear input"
          aria-label="Clear input"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});
