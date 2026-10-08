'use client';

import { useState } from 'react';
import { RotateCw, X } from 'lucide-react';
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
  const [showAllPills, setShowAllPills] = useState(false);

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

      {/* Quick select existing vendors with toggle-to-unselect and +X more expansion */}
      {conventionVendors && conventionVendors.length > 0 ? (
        <div className="mt-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="block text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-300">
              Existing at this con ({conventionVendors.length}):
            </span>
            <button
              type="button"
              onClick={() => refreshVendors()}
              disabled={isRefreshingVendors}
              title="Refresh vendors and booth locations"
              aria-label="Refresh vendors and booth locations"
              className="inline-flex cursor-pointer items-center gap-1 text-[10px] font-bold tracking-wider text-zinc-500 uppercase transition-colors hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              <RotateCw
                className={cn('h-3 w-3', isRefreshingVendors && 'text-accent animate-spin')}
              />
              <span>{isRefreshingVendors ? 'Syncing…' : 'Refresh'}</span>
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(showAllPills ? conventionVendors : conventionVendors.slice(0, 8)).map((v) => {
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
                  title={isSelected ? 'Click to unselect' : 'Click to select'}
                  className={cn(
                    'border-ink cursor-pointer border px-2 py-0.5 text-[11px] font-bold uppercase transition-all',
                    isSelected
                      ? 'bg-accent text-white shadow-[1px_1px_0_var(--ink)] dark:text-zinc-950'
                      : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700'
                  )}
                >
                  {v.name}
                </button>
              );
            })}
            {conventionVendors.length > 8 && (
              <button
                type="button"
                onClick={() => setShowAllPills((prev) => !prev)}
                className="cursor-pointer text-[10px] font-bold text-zinc-500 underline dark:text-zinc-400"
              >
                {showAllPills ? 'Show less' : `+${conventionVendors.length - 8} more`}
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
