'use client';

import { cn } from '@/shared/lib/utils';
import { CharCounter } from './CharCounter';

export interface BoothLocationFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  knownBooths?: string[];
  error?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function BoothLocationField({
  id = 'location',
  value,
  onChange,
  knownBooths,
  error,
  label = 'Booth / Hall Location',
  required = true,
  placeholder = 'e.g. Booth #1420, Hall B #204',
  onKeyDown,
}: BoothLocationFieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="font-display block text-xs tracking-wider uppercase">
          {label} {required && <span className="text-accent">*</span>}
        </label>
        <CharCounter current={value.length} max={50} />
      </div>

      <input
        id={id}
        type="text"
        maxLength={50}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="border-ink focus:ring-accent mt-1.5 h-10 w-full border-2 bg-white px-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:outline-none sm:h-11 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
      />

      {error ? (
        <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p>
      ) : null}

      {/* Known Booths Pill Selector */}
      {knownBooths && knownBooths.length > 0 && (
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              Known booth{knownBooths.length > 1 ? 's' : ''} ({knownBooths.length}):
            </span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Click to select</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {knownBooths.map((booth) => {
              const isSelected = value.trim().toLowerCase() === booth.toLowerCase();

              return (
                <button
                  key={booth}
                  type="button"
                  onClick={() => onChange(isSelected ? '' : booth)}
                  title={isSelected ? 'Click to unselect this booth' : 'Click to select this booth'}
                  className={cn(
                    'border-ink cursor-pointer border px-2 py-0.5 text-[11px] font-bold transition-all',
                    isSelected
                      ? 'bg-accent text-white shadow-[1px_1px_0_var(--ink)] dark:text-zinc-950'
                      : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700'
                  )}
                >
                  {booth}
                  {isSelected ? ' ×' : ''}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
