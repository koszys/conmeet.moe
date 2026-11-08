import type { ComponentProps } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface SearchInputProps extends Omit<ComponentProps<'input'>, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  wrapperClassName?: string;
}

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  wrapperClassName,
  className,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn('relative w-full', wrapperClassName)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-300" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'border-ink w-full border-2 bg-zinc-50 py-2 text-xs shadow-[2px_2px_0_var(--ink)] transition-colors placeholder:text-zinc-500 focus:bg-white focus:outline-none dark:bg-zinc-950 dark:placeholder:text-zinc-300 dark:focus:bg-black',
          value && onClear ? 'pr-9 pl-9' : 'pr-3 pl-9',
          className
        )}
        {...props}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          title="Clear search"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
