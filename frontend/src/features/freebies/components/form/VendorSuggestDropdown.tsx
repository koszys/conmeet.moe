'use client';

import { Plus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { SuggestionVendor } from './useVendorSuggestions';

export function highlightMatch(text: string, query: string) {
  const trimmed = query.trim();
  if (!trimmed) return text;
  const index = text.toLowerCase().indexOf(trimmed.toLowerCase());
  if (index === -1) return text;
  const before = text.slice(0, index);
  const match = text.slice(index, index + trimmed.length);
  const after = text.slice(index + trimmed.length);
  return (
    <>
      {before}
      <span className="bg-accent/15 text-accent dark:bg-accent/25 decoration-accent/40 px-0.5 font-bold underline underline-offset-2 dark:text-teal-300">
        {match}
      </span>
      {after}
    </>
  );
}

interface VendorSuggestDropdownProps {
  filteredSuggestions: SuggestionVendor[];
  selectedVendorName: string;
  highlightedIndex: number;
  suggestListRef: React.RefObject<HTMLDivElement | null>;
  onSelectVendor: (
    vendorName: string,
    options?: { toggleIfSelected?: boolean; advanceFocus?: boolean }
  ) => void;
  onHighlightIndex: (index: number) => void;
}

export function VendorSuggestDropdown({
  filteredSuggestions,
  selectedVendorName,
  highlightedIndex,
  suggestListRef,
  onSelectVendor,
  onHighlightIndex,
}: VendorSuggestDropdownProps) {
  const trimmedName = selectedVendorName.trim();

  return (
    <div
      ref={suggestListRef}
      className="border-ink absolute top-full right-0 left-0 z-30 mt-1 max-h-64 overflow-y-auto border-2 bg-white shadow-[4px_4px_0_var(--ink)] dark:bg-zinc-900"
    >
      {filteredSuggestions.length > 0 ? (
        <div className="py-1">
          <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-1.5 text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:border-zinc-800 dark:text-zinc-400">
            <span>{trimmedName ? 'Matching Vendors' : 'Suggested Vendors'}</span>
            <span>{filteredSuggestions.length} found</span>
          </div>
          {filteredSuggestions.map((v, idx) => {
            const isSelected = trimmedName.toLowerCase() === v.name.toLowerCase();
            const isHighlighted = idx === highlightedIndex;

            return (
              <button
                key={`${v.id}-${v.name}`}
                data-suggest-item="true"
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelectVendor(v.name, {
                    toggleIfSelected: false,
                    advanceFocus: true,
                  });
                }}
                onMouseEnter={() => onHighlightIndex(idx)}
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-xs transition-colors',
                  isSelected ? 'bg-accent/15 dark:bg-accent/25 font-bold' : '',
                  isHighlighted ? 'bg-zinc-100 dark:bg-zinc-800' : ''
                )}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                    {highlightMatch(v.name, selectedVendorName)}
                  </span>
                  {isSelected && (
                    <span className="border-ink border-accent/40 bg-accent/15 text-accent dark:border-accent/40 dark:bg-accent/20 inline-flex items-center gap-1 border px-1.5 py-0.5 text-[9px] font-bold dark:text-teal-300">
                      Selected · click to unselect
                    </span>
                  )}
                </div>
                <div className="ml-2 flex shrink-0 items-center gap-1.5">
                  {v.isCurrentCon ? (
                    <span className="border-ink bg-accent inline-flex items-center border px-1.5 py-0.5 font-mono text-[9px] font-black text-white uppercase shadow-[1px_1px_0_var(--ink)] dark:text-zinc-950">
                      At this con
                    </span>
                  ) : (
                    <span className="border border-zinc-300 px-1.5 py-0.5 font-mono text-[9px] font-bold text-zinc-500 uppercase dark:border-zinc-700 dark:text-zinc-400">
                      Known vendor
                    </span>
                  )}
                  {v.knownLocations && v.knownLocations.length > 0 && (
                    <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                      {v.knownLocations.length === 1
                        ? v.knownLocations[0]
                        : `${v.knownLocations.length} booths`}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : trimmedName ? (
        <div className="flex items-start gap-2.5 p-3 text-xs">
          <div className="border-ink bg-accent flex h-6 w-6 shrink-0 items-center justify-center border text-white shadow-[1px_1px_0_var(--ink)] dark:text-zinc-950">
            <Plus className="h-3.5 w-3.5 stroke-3" />
          </div>
          <div>
            <p className="font-bold text-zinc-900 dark:text-zinc-100">
              New vendor: &ldquo;{trimmedName}&rdquo;
            </p>
            <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              Will be registered automatically upon posting.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
