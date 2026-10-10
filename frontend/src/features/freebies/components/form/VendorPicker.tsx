'use client';

import { useState } from 'react';
import { ChevronUp, Plus, RotateCw, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { CharCounter } from './CharCounter';
import { VendorSuggestDropdown } from './VendorSuggestDropdown';
import type { useVendorSuggestions } from './useVendorSuggestions';

export interface VendorPickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  suggestions: ReturnType<typeof useVendorSuggestions>;
  onLocationAutoFill?: (location: string) => void;
  label?: string;
  required?: boolean;
}

export function VendorPicker({
  id = 'vendor_name',
  value,
  onChange,
  error,
  suggestions,
  onLocationAutoFill,
  label = 'Vendor / Company Name',
  required = true,
}: VendorPickerProps) {
  const INITIAL_LIMIT = 5;
  const INCREMENT_STEP = 5;
  const [visibleLimit, setVisibleLimit] = useState(INITIAL_LIMIT);

  const {
    conventionVendors,
    vendorLocationsMap,
    combinedVendors,
    filteredSuggestions,
    isSuggestOpen,
    setIsSuggestOpen,
    highlightedIndex,
    setHighlightedIndex,
    autoFilledFromVendor,
    setAutoFilledFromVendor,
    inputWrapRef,
    suggestListRef,
    handleSelectVendor,
    handleVendorKeyDown,
    refreshVendors,
    isRefreshingVendors,
  } = suggestions;

  const totalVendors = conventionVendors?.length || 0;
  const displayedVendors = conventionVendors ? conventionVendors.slice(0, visibleLimit) : [];
  const hasMore = visibleLimit < totalVendors;
  const nextIncrement = Math.min(INCREMENT_STEP, totalVendors - visibleLimit);
  const canCollapse = visibleLimit > INITIAL_LIMIT;

  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="font-display block text-xs tracking-wider uppercase">
          {label} {required && <span className="text-accent">*</span>}
        </label>
        <CharCounter current={value.length} max={50} />
      </div>

      <div className="relative mt-1.5" ref={inputWrapRef}>
        <input
          id={id}
          type="text"
          autoComplete="off"
          maxLength={50}
          value={value}
          onChange={(e) => {
            const val = e.target.value;
            onChange(val);
            if (!isSuggestOpen) setIsSuggestOpen(true);
            setHighlightedIndex(-1);

            const trimmed = val.trim();
            const match = combinedVendors.find(
              (v) => v.name.toLowerCase() === trimmed.toLowerCase()
            );
            if (match) {
              const knownLocs = vendorLocationsMap.get(match.name.toLowerCase()) || [];
              if (knownLocs.length > 0) {
                if (onLocationAutoFill) {
                  onLocationAutoFill(knownLocs[0]);
                }
                setAutoFilledFromVendor(match.name);
              }
            }
          }}
          onFocus={() => setIsSuggestOpen(true)}
          onKeyDown={handleVendorKeyDown}
          placeholder="e.g. HoYoverse, Good Smile Company, Artist Table A12"
          className="border-ink focus:ring-accent h-10 w-full border-2 bg-white pr-9 pl-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:outline-none sm:h-11 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
        />

        {/* Instant Clear Button */}
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange('');
              if (autoFilledFromVendor) {
                if (onLocationAutoFill) {
                  onLocationAutoFill('');
                }
                setAutoFilledFromVendor(null);
              }
              setIsSuggestOpen(false);
              setHighlightedIndex(-1);
            }}
            className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            title="Clear vendor name"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}

        {/* Auto-suggest Dropdown */}
        {isSuggestOpen && (
          <VendorSuggestDropdown
            filteredSuggestions={filteredSuggestions}
            selectedVendorName={value}
            highlightedIndex={highlightedIndex}
            suggestListRef={suggestListRef}
            onSelectVendor={handleSelectVendor}
            onHighlightIndex={setHighlightedIndex}
          />
        )}
      </div>

      {error ? (
        <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p>
      ) : null}

      {/* Quick select existing vendors with incremental +X more and show less controls */}
      {conventionVendors && conventionVendors.length > 0 ? (
        <div className="mt-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="block text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-300">
              Existing at this con ({totalVendors}):
            </span>
            <button
              type="button"
              onClick={() => refreshVendors()}
              disabled={isRefreshingVendors}
              title="Refresh vendors and booth locations"
              aria-label="Refresh vendors and booth locations"
              className="border-ink bg-accent inline-flex cursor-pointer items-center gap-1 border px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase shadow-[1px_1px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-950"
            >
              <RotateCw className={cn('h-2.5 w-2.5', isRefreshingVendors && 'animate-spin')} />
              <span>{isRefreshingVendors ? 'Syncing…' : 'Refresh'}</span>
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 transition-all duration-300">
            {displayedVendors.map((v, index) => {
              const isSelected = value.trim().toLowerCase() === v.name.toLowerCase();
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    handleSelectVendor(v.name, {
                      toggleIfSelected: true,
                    });
                  }}
                  style={{ animationDelay: `${(index % INCREMENT_STEP) * 25}ms` }}
                  title={isSelected ? 'Click to unselect' : 'Click to select'}
                  className={cn(
                    'border-ink animate-pill-pop cursor-pointer border px-2 py-0.5 text-[11px] font-bold uppercase transition-all duration-150 hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none',
                    isSelected
                      ? 'bg-accent text-white shadow-[1px_1px_0_var(--ink)] dark:text-zinc-950'
                      : 'bg-zinc-100 hover:bg-zinc-200 hover:shadow-[1px_1px_0_var(--ink)] dark:bg-zinc-800 dark:hover:bg-zinc-700'
                  )}
                >
                  {v.name}
                </button>
              );
            })}

            {/* Incremental Show More Button */}
            {hasMore && (
              <button
                type="button"
                onClick={() =>
                  setVisibleLimit((prev) => Math.min(prev + INCREMENT_STEP, totalVendors))
                }
                title={`Show next ${nextIncrement} vendors`}
                className="border-ink bg-accent inline-flex cursor-pointer items-center gap-1 border px-1.5 py-0.5 text-[10px] font-bold text-white uppercase shadow-[1px_1px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none dark:text-zinc-950"
              >
                <Plus className="h-2.5 w-2.5 stroke-3" />
                <span>+{nextIncrement} more</span>
              </button>
            )}

            {/* Show Less Button */}
            {canCollapse && (
              <button
                type="button"
                onClick={() => setVisibleLimit(INITIAL_LIMIT)}
                title="Collapse vendor list back to top vendors"
                className="border-ink bg-accent inline-flex cursor-pointer items-center gap-1 border px-1.5 py-0.5 text-[10px] font-bold text-white uppercase shadow-[1px_1px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none dark:text-zinc-950"
              >
                <ChevronUp className="h-2.5 w-2.5 stroke-3" />
                <span>Show less</span>
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
