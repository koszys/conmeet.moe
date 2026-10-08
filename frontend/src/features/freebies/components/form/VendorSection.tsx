'use client';

import { useState } from 'react';
import type { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { Sparkles, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { MultiFreebieFormValues } from './schema';
import { CharCounter } from './CharCounter';
import { VendorSuggestDropdown } from './VendorSuggestDropdown';
import type { useVendorSuggestions } from './useVendorSuggestions';

interface VendorSectionProps {
  register: UseFormRegister<MultiFreebieFormValues>;
  setValue: UseFormSetValue<MultiFreebieFormValues>;
  errors: FieldErrors<MultiFreebieFormValues>;
  selectedVendorName: string;
  selectedLocation: string;
  suggestions: ReturnType<typeof useVendorSuggestions>;
}

export function VendorSection({
  register,
  setValue,
  errors,
  selectedVendorName,
  selectedLocation,
  suggestions,
}: VendorSectionProps) {
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
    handleToggleLocation,
    handleVendorKeyDown,
  } = suggestions;

  const currentVendorLocations =
    vendorLocationsMap.get(selectedVendorName.trim().toLowerCase()) || [];

  return (
    <div className="border-ink space-y-4 border-2 bg-white p-4 shadow-[3px_3px_0_var(--ink)] sm:p-5 dark:bg-zinc-900">
      <div className="border-ink border-b-2 border-dashed pb-2">
        <h2 className="font-display text-xs tracking-wider text-zinc-900 uppercase dark:text-zinc-100">
          Booth & Vendor Details
        </h2>
        <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
          Shared across all freebies posted in this entry.
        </p>
      </div>

      {/* Vendor / Booth Name */}
      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="vendor_name"
            className="font-display block text-xs tracking-wider uppercase"
          >
            Vendor / Company Name <span className="text-accent">*</span>
          </label>
          <CharCounter current={selectedVendorName.length} max={50} />
        </div>

        <div className="relative mt-1.5" ref={inputWrapRef}>
          <input
            id="vendor_name"
            type="text"
            autoComplete="off"
            maxLength={50}
            placeholder="e.g. HoYoverse, Good Smile Company, Artist Table A12"
            {...register('vendor_name', {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                if (!isSuggestOpen) setIsSuggestOpen(true);
                setHighlightedIndex(-1);
                const val = e.target.value.trim();
                const match = combinedVendors.find(
                  (v) => v.name.toLowerCase() === val.toLowerCase()
                );
                if (match) {
                  const knownLocs = vendorLocationsMap.get(match.name.toLowerCase()) || [];
                  if (knownLocs.length > 0) {
                    setValue('location', knownLocs[0], { shouldValidate: true });
                    setAutoFilledFromVendor(match.name);
                  }
                }
              },
            })}
            onFocus={() => {
              setIsSuggestOpen(true);
            }}
            onKeyDown={handleVendorKeyDown}
            className="border-ink focus:ring-accent h-11 w-full border-2 bg-white px-3 pr-9 text-sm font-medium text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
          />

          {/* Instant Clear Button */}
          {selectedVendorName ? (
            <button
              type="button"
              onClick={() => {
                setValue('vendor_name', '', { shouldValidate: true });
                if (autoFilledFromVendor) {
                  setValue('location', '', { shouldValidate: true });
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

          {/* Neo-brutalist Auto-Suggest Dropdown */}
          {isSuggestOpen && (
            <VendorSuggestDropdown
              filteredSuggestions={filteredSuggestions}
              selectedVendorName={selectedVendorName}
              highlightedIndex={highlightedIndex}
              suggestListRef={suggestListRef}
              onSelectVendor={handleSelectVendor}
              onHighlightIndex={setHighlightedIndex}
            />
          )}
        </div>

        {errors.vendor_name ? (
          <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
            {errors.vendor_name.message}
          </p>
        ) : null}

        {/* Quick select existing vendors with toggle-to-unselect and +X more expansion */}
        {conventionVendors && conventionVendors.length > 0 ? (
          <div className="mt-2.5 space-y-1.5">
            <span className="block text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-300">
              Existing at this con ({conventionVendors.length}):
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {(showAllPills ? conventionVendors : conventionVendors.slice(0, 8)).map((v) => {
                const isSelected = selectedVendorName.trim().toLowerCase() === v.name.toLowerCase();
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() =>
                      handleSelectVendor(v.name, {
                        toggleIfSelected: true,
                        advanceFocus: !isSelected,
                      })
                    }
                    title={isSelected ? 'Click to unselect' : 'Click to select'}
                    className={cn(
                      'border-ink cursor-pointer border px-2 py-0.5 text-[11px] font-bold uppercase transition-all',
                      isSelected
                        ? 'bg-accent text-white shadow-[1px_1px_0_var(--ink)] dark:text-zinc-950'
                        : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700'
                    )}
                  >
                    {v.name}
                    {isSelected ? ' ×' : ''}
                  </button>
                );
              })}

              {conventionVendors.length > 8 ? (
                <button
                  type="button"
                  onClick={() => setShowAllPills((prev) => !prev)}
                  className="cursor-pointer border border-dashed border-zinc-400 px-2 py-0.5 text-[10px] font-bold text-zinc-600 uppercase hover:border-zinc-700 hover:text-zinc-900 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-zinc-400 dark:hover:text-white"
                >
                  {showAllPills ? 'Show less' : `+${conventionVendors.length - 8} more`}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {/* Booth Location */}
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="location" className="font-display block text-xs tracking-wider uppercase">
            Booth / Hall Location
          </label>
          <CharCounter current={selectedLocation.length} max={150} />
        </div>
        <input
          id="location"
          type="text"
          maxLength={150}
          placeholder="e.g. Booth #1420, Hall B #204"
          {...register('location', {
            onChange: () => {
              if (autoFilledFromVendor) {
                setAutoFilledFromVendor(null);
              }
            },
          })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const target = document.getElementById('items.0.name');
              if (target) {
                target.focus();
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
          }}
          className="border-ink focus:ring-accent mt-1.5 h-11 w-full border-2 bg-white px-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
        />

        {/* Known Booths Pill Selector */}
        {currentVendorLocations.length > 0 && (
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                Known booth{currentVendorLocations.length > 1 ? 's' : ''} for{' '}
                {selectedVendorName.trim()} ({currentVendorLocations.length}):
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                Click to select or combine
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {currentVendorLocations.map((booth) => {
                const currentParts = selectedLocation.split(',').map((s) => s.trim().toLowerCase());
                const isSelected = currentParts.includes(booth.toLowerCase());

                return (
                  <button
                    key={booth}
                    type="button"
                    onClick={() => handleToggleLocation(booth)}
                    title={isSelected ? 'Click to remove this booth' : 'Click to add this booth'}
                    className={cn(
                      'border-ink cursor-pointer border px-2 py-0.5 text-[11px] font-bold transition-all',
                      isSelected
                        ? 'bg-accent text-white shadow-[1px_1px_0_var(--ink)] dark:text-zinc-950'
                        : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700'
                    )}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {booth}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {autoFilledFromVendor ? (
          <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
            <Sparkles className="h-3 w-3" /> Auto-filled from previous drops by{' '}
            {autoFilledFromVendor}
          </p>
        ) : null}
        {errors.location ? (
          <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
            {errors.location.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
