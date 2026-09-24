'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ImagePlus, Loader2, Plus, Sparkles, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { CONBLOCK, CONBLOCK_PRIMARY } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { useFreebies, useVendors } from '../api/queries';
import { useCreateFreebie } from '../api/mutations';

interface SuggestionVendor {
  id: number;
  name: string;
  isCurrentCon: boolean;
  knownLocation?: string;
}

function highlightMatch(text: string, query: string) {
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

const freebieItemSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters').max(60, 'Max 60 characters'),
  requirements: z.string().max(200, 'Max 200 characters').optional(),
  description: z.string().max(300, 'Max 300 characters').optional(),
});

const multiFreebieSchema = z.object({
  vendor_name: z.string().min(1, 'Vendor / company name is required').max(50, 'Max 50 characters'),
  location: z.string().max(50, 'Max 50 characters').optional(),
  items: z.array(freebieItemSchema).min(1, 'At least one freebie item is required'),
});

type MultiFreebieFormValues = z.infer<typeof multiFreebieSchema>;

function CharCounter({ current, max }: { current: number; max: number }) {
  const isAtLimit = current >= max;
  const isNearLimit = current >= max * 0.85;
  return (
    <span
      className={cn(
        'font-mono text-[10px] tracking-normal transition-colors',
        isAtLimit
          ? 'font-bold text-rose-500 dark:text-rose-400'
          : isNearLimit
            ? 'font-bold text-zinc-700 dark:text-zinc-200'
            : 'text-zinc-400 dark:text-zinc-500'
      )}
    >
      {current}/{max}
    </span>
  );
}

export function FreebieForm({
  conventionSlug,
  conventionName,
}: {
  conventionSlug: string;
  conventionName?: string;
}) {
  const router = useRouter();
  const createMutation = useCreateFreebie();
  const { data: conventionVendors } = useVendors(conventionSlug);
  const { data: allVendors } = useVendors();
  const { data: conventionFreebies } = useFreebies({ convention: conventionSlug });

  const [itemImages, setItemImages] = useState<Record<string, { file: File; preview: string }>>({});
  const [submittingProgress, setSubmittingProgress] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Auto-suggest and pills state
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showAllPills, setShowAllPills] = useState(false);
  const [autoFilledFromVendor, setAutoFilledFromVendor] = useState<string | null>(null);

  const inputWrapRef = useRef<HTMLDivElement>(null);
  const suggestListRef = useRef<HTMLDivElement>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MultiFreebieFormValues>({
    resolver: zodResolver(multiFreebieSchema),
    defaultValues: {
      vendor_name: '',
      location: '',
      items: [{ name: '', requirements: '', description: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const selectedVendorName = watch('vendor_name') || '';
  const selectedLocation = watch('location') || '';
  const watchedItems = watch('items') || [];

  // Build map of vendor name -> known booth location at this convention
  const vendorLocationMap = useMemo(() => {
    const map = new Map<string, string>();
    if (conventionFreebies) {
      for (const f of conventionFreebies) {
        if (f.vendor?.name && f.location?.trim() && !map.has(f.vendor.name.toLowerCase())) {
          map.set(f.vendor.name.toLowerCase(), f.location.trim());
        }
      }
    }
    return map;
  }, [conventionFreebies]);

  // Combine convention vendors and all registered vendors (prioritizing current con)
  const combinedVendors = useMemo<SuggestionVendor[]>(() => {
    const seen = new Set<string>();
    const list: SuggestionVendor[] = [];

    if (conventionVendors) {
      for (const v of conventionVendors) {
        const lower = v.name.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          list.push({
            id: v.id,
            name: v.name,
            isCurrentCon: true,
            knownLocation: vendorLocationMap.get(lower),
          });
        }
      }
    }

    if (allVendors) {
      for (const v of allVendors) {
        const lower = v.name.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          list.push({
            id: v.id,
            name: v.name,
            isCurrentCon: false,
            knownLocation: vendorLocationMap.get(lower),
          });
        }
      }
    }

    return list;
  }, [conventionVendors, allVendors, vendorLocationMap]);

  // Filter suggestions by typed vendor query
  const filteredSuggestions = useMemo(() => {
    const q = selectedVendorName.trim().toLowerCase();
    if (!q) {
      return combinedVendors.slice(0, 10);
    }
    return combinedVendors.filter((v) => v.name.toLowerCase().includes(q)).slice(0, 15);
  }, [combinedVendors, selectedVendorName]);

  // Close auto-suggest on outside click
  useEffect(() => {
    if (!isSuggestOpen) return;
    function handlePointerDown(e: PointerEvent) {
      if (inputWrapRef.current && !inputWrapRef.current.contains(e.target as Node)) {
        setIsSuggestOpen(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isSuggestOpen]);

  // Scroll highlighted suggestion item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && suggestListRef.current) {
      const items = suggestListRef.current.querySelectorAll('[data-suggest-item]');
      const activeItem = items[highlightedIndex] as HTMLElement | undefined;
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  // Selection & unselection handler
  function handleSelectVendor(
    vendorName: string,
    options?: { toggleIfSelected?: boolean; advanceFocus?: boolean }
  ) {
    const isSelected = selectedVendorName.trim().toLowerCase() === vendorName.trim().toLowerCase();

    if (options?.toggleIfSelected && isSelected) {
      // Explicit toggle off / Unselect
      setValue('vendor_name', '', { shouldValidate: true });
      if (
        autoFilledFromVendor &&
        autoFilledFromVendor.toLowerCase() === vendorName.trim().toLowerCase()
      ) {
        setValue('location', '', { shouldValidate: true });
        setAutoFilledFromVendor(null);
      }
      setIsSuggestOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    // Select
    const match = combinedVendors.find(
      (v) => v.name.toLowerCase() === vendorName.trim().toLowerCase()
    );
    const canonicalName = match ? match.name : vendorName.trim();

    setValue('vendor_name', canonicalName, { shouldValidate: true });

    // Auto-fill location if currently blank and known
    let effectiveLocation = selectedLocation.trim();
    const knownLoc = vendorLocationMap.get(canonicalName.toLowerCase());
    if (knownLoc && !effectiveLocation) {
      setValue('location', knownLoc, { shouldValidate: true });
      setAutoFilledFromVendor(canonicalName);
      effectiveLocation = knownLoc;
    }

    setIsSuggestOpen(false);
    setHighlightedIndex(-1);

    if (options?.advanceFocus) {
      requestAnimationFrame(() => {
        const target = effectiveLocation
          ? document.getElementById('items.0.name')
          : document.getElementById('location');
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
  }

  // Keyboard navigation for suggestions & Enter key advancing
  function handleVendorKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!isSuggestOpen) {
        e.preventDefault();
        setIsSuggestOpen(true);
        setHighlightedIndex(0);
        return;
      }
      e.preventDefault();
      if (e.key === 'ArrowDown') {
        setHighlightedIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0));
      } else {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
      }
      return;
    }

    if (e.key === 'Escape') {
      if (isSuggestOpen) {
        e.preventDefault();
        setIsSuggestOpen(false);
        setHighlightedIndex(-1);
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();

      let vendorToSelect = selectedVendorName.trim();

      if (isSuggestOpen && highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
        vendorToSelect = filteredSuggestions[highlightedIndex].name;
      } else if (isSuggestOpen && filteredSuggestions.length > 0) {
        // If nothing explicitly highlighted, match current text or pick top suggestion
        const exactMatch = filteredSuggestions.find(
          (v) => v.name.toLowerCase() === vendorToSelect.toLowerCase()
        );
        if (exactMatch) {
          vendorToSelect = exactMatch.name;
        } else if (!vendorToSelect) {
          vendorToSelect = filteredSuggestions[0].name;
        }
      }

      if (vendorToSelect) {
        handleSelectVendor(vendorToSelect, { toggleIfSelected: false, advanceFocus: true });
      } else {
        setIsSuggestOpen(false);
        setHighlightedIndex(-1);
        const loc = document.getElementById('location');
        if (loc) {
          loc.focus();
          loc.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }

  function handleItemImageChange(fieldId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (itemImages[fieldId]) {
        URL.revokeObjectURL(itemImages[fieldId].preview);
      }
      const url = URL.createObjectURL(file);
      setItemImages((prev) => ({
        ...prev,
        [fieldId]: { file, preview: url },
      }));
    }
  }

  function removeItemImage(fieldId: string) {
    if (itemImages[fieldId]) {
      URL.revokeObjectURL(itemImages[fieldId].preview);
      setItemImages((prev) => {
        const copy = { ...prev };
        delete copy[fieldId];
        return copy;
      });
    }
  }

  function handleRemoveItem(index: number) {
    const fieldId = fields[index]?.id;
    if (fieldId) {
      removeItemImage(fieldId);
    }
    remove(index);
  }

  async function onSubmit(values: MultiFreebieFormValues) {
    setServerError(null);
    try {
      const trimmedVendor = values.vendor_name.trim();
      const existingMatch = combinedVendors.find(
        (v) => v.name.toLowerCase() === trimmedVendor.toLowerCase()
      );
      const canonicalVendorName = existingMatch ? existingMatch.name : trimmedVendor;
      const canonicalLocation = values.location?.trim() || '';

      const total = values.items.length;
      for (let i = 0; i < total; i++) {
        const item = values.items[i];
        const fieldId = fields[i]?.id;
        const imageFile = fieldId ? itemImages[fieldId]?.file : undefined;

        setSubmittingProgress(`Submitting ${i + 1} of ${total}…`);

        const formData = new FormData();
        formData.append('name', item.name.trim());
        formData.append('vendor_name', canonicalVendorName);
        formData.append('convention_slug', conventionSlug);
        if (canonicalLocation) formData.append('location', canonicalLocation);
        if (item.requirements?.trim()) formData.append('requirements', item.requirements.trim());
        if (item.description?.trim()) formData.append('description', item.description.trim());
        if (imageFile) formData.append('image', imageFile);

        await createMutation.mutateAsync(formData);
      }

      router.push(`/conventions/${conventionSlug}/freebies`);
    } catch (err: unknown) {
      setSubmittingProgress(null);
      if (err && typeof err === 'object' && 'response' in err) {
        setServerError('Failed to submit freebie(s). Please check your inputs and try again.');
      } else {
        setServerError('A network error occurred. Please check your connection.');
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="border-ink border-b-2 pb-5">
        <Link
          href={`/conventions/${conventionSlug}/freebies`}
          className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-zinc-600 uppercase hover:underline dark:text-zinc-300 dark:hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Freebies Board
        </Link>

        <h1 className="font-display mt-3 text-2xl tracking-wide uppercase sm:text-3xl">
          Post Freebie Drops
        </h1>
        <p className="mt-1 text-xs text-zinc-600 sm:text-sm dark:text-zinc-300">
          Share giveaways, limited merch drops, or stamp rallies for{' '}
          {conventionName || 'this convention'}.
        </p>
      </div>

      {serverError ? (
        <div className="border-ink border-2 bg-rose-50 p-4 text-xs font-bold text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
          {serverError}
        </div>
      ) : null}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Shared Booth Details Card */}
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
                  onChange: () => {
                    if (!isSuggestOpen) setIsSuggestOpen(true);
                    setHighlightedIndex(-1);
                    if (autoFilledFromVendor) {
                      setAutoFilledFromVendor(null);
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
                <div
                  ref={suggestListRef}
                  className="border-ink absolute top-full right-0 left-0 z-30 mt-1 max-h-64 overflow-y-auto border-2 bg-white shadow-[4px_4px_0_var(--ink)] dark:bg-zinc-900"
                >
                  {filteredSuggestions.length > 0 ? (
                    <div className="py-1">
                      <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-1.5 text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:border-zinc-800 dark:text-zinc-400">
                        <span>
                          {selectedVendorName.trim() ? 'Matching Vendors' : 'Suggested Vendors'}
                        </span>
                        <span>{filteredSuggestions.length} found</span>
                      </div>
                      {filteredSuggestions.map((v, idx) => {
                        const isSelected =
                          selectedVendorName.trim().toLowerCase() === v.name.toLowerCase();
                        const isHighlighted = idx === highlightedIndex;

                        return (
                          <button
                            key={`${v.id}-${v.name}`}
                            data-suggest-item="true"
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectVendor(v.name, {
                                toggleIfSelected: false,
                                advanceFocus: true,
                              });
                            }}
                            onMouseEnter={() => setHighlightedIndex(idx)}
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
                              {v.knownLocation && (
                                <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                                  {v.knownLocation}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : selectedVendorName.trim() ? (
                    <div className="flex items-start gap-2.5 p-3 text-xs">
                      <div className="border-ink bg-accent flex h-6 w-6 shrink-0 items-center justify-center border text-white shadow-[1px_1px_0_var(--ink)] dark:text-zinc-950">
                        <Plus className="h-3.5 w-3.5 stroke-3" />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100">
                          New vendor: &ldquo;{selectedVendorName.trim()}&rdquo;
                        </p>
                        <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                          Will be registered automatically upon posting.
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {errors.vendor_name ? (
              <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                {errors.vendor_name.message}
              </p>
            ) : null}

            {/* Quick select existing vendors with toggle-to-unselect and +X more expansion */}
            {conventionVendors && conventionVendors.length > 0 ? (
              <div className="mt-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-300">
                    Existing at this con ({conventionVendors.length}):
                  </span>
                  {(showAllPills ? conventionVendors : conventionVendors.slice(0, 8)).map((v) => {
                    const isSelected =
                      selectedVendorName.trim().toLowerCase() === v.name.toLowerCase();
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
              <label
                htmlFor="location"
                className="font-display block text-xs tracking-wider uppercase"
              >
                Booth / Hall Location
              </label>
              <CharCounter current={selectedLocation.length} max={50} />
            </div>
            <input
              id="location"
              type="text"
              maxLength={50}
              placeholder="e.g. Booth #1420 (Exhibitor Hall A)"
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
            {autoFilledFromVendor ? (
              <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
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

        {/* Dynamic Freebie Items List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xs tracking-wider text-zinc-700 uppercase dark:text-zinc-300">
              Freebie Items ({fields.length})
            </h2>
          </div>

          {fields.map((field, index) => {
            const itemVal = watchedItems[index] || { name: '', requirements: '', description: '' };
            const fieldId = field.id;
            const currentImg = itemImages[fieldId];
            const itemErrors = errors.items?.[index];

            return (
              <div
                key={field.id}
                className="border-ink space-y-4 border-2 bg-white p-4 shadow-[3px_3px_0_var(--ink)] sm:p-5 dark:bg-zinc-900"
              >
                {/* Item Card Header */}
                <div className="border-ink flex items-center justify-between border-b-2 border-dashed pb-2.5">
                  <span className="font-display text-xs tracking-wider text-zinc-900 uppercase dark:text-zinc-100">
                    Freebie #{index + 1}
                  </span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-bold text-rose-600 uppercase transition-colors hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  )}
                </div>

                {/* Item Title */}
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={`items.${index}.name`}
                      className="border-ink font-display block text-xs tracking-wider uppercase"
                    >
                      Item Name <span className="text-accent">*</span>
                    </label>
                    <CharCounter current={(itemVal.name || '').length} max={60} />
                  </div>
                  <input
                    id={`items.${index}.name`}
                    type="text"
                    maxLength={60}
                    placeholder="e.g. Genshin Impact Acrylic Standee"
                    {...register(`items.${index}.name`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const target = document.getElementById(`items.${index}.requirements`);
                        if (target) {
                          target.focus();
                          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }
                    }}
                    className="border-ink focus:ring-accent mt-1.5 h-11 w-full border-2 bg-white px-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
                  />
                  {itemErrors?.name ? (
                    <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                      {itemErrors.name.message}
                    </p>
                  ) : null}
                </div>

                {/* Requirements / How to Get It */}
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={`items.${index}.requirements`}
                      className="font-display block text-xs tracking-wider uppercase"
                    >
                      How to Get It (Requirements)
                    </label>
                    <CharCounter current={(itemVal.requirements || '').length} max={200} />
                  </div>
                  <textarea
                    id={`items.${index}.requirements`}
                    rows={2}
                    maxLength={200}
                    placeholder="e.g. Follow @HoYoverse on X and show badge, or play demo"
                    {...register(`items.${index}.requirements`)}
                    className="border-ink focus:ring-accent mt-1.5 w-full border-2 bg-white p-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
                  />
                  {itemErrors?.requirements ? (
                    <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                      {itemErrors.requirements.message}
                    </p>
                  ) : null}
                </div>

                {/* Additional Description */}
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={`items.${index}.description`}
                      className="font-display block text-xs tracking-wider uppercase"
                    >
                      Additional Details / Notes
                    </label>
                    <CharCounter current={(itemVal.description || '').length} max={300} />
                  </div>
                  <textarea
                    id={`items.${index}.description`}
                    rows={3}
                    maxLength={300}
                    placeholder="e.g. Limited to 200 per day! Drops start at 11:00 AM."
                    {...register(`items.${index}.description`)}
                    className="border-ink focus:ring-accent mt-1.5 w-full border-2 bg-white p-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
                  />
                  {itemErrors?.description ? (
                    <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                      {itemErrors.description.message}
                    </p>
                  ) : null}
                </div>

                {/* Photo Upload for Item */}
                <div>
                  <span className="font-display block text-xs tracking-wider uppercase">
                    Photo of Item #{index + 1} (Optional)
                  </span>

                  {currentImg ? (
                    <div className="border-ink relative mt-2 aspect-video w-full max-w-sm overflow-hidden border-2 bg-zinc-100 shadow-[4px_4px_0_var(--ink)] dark:bg-zinc-800">
                      <Image
                        src={currentImg.preview}
                        alt={`Preview #${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeItemImage(fieldId)}
                        className="border-ink absolute top-2 right-2 flex h-7 w-7 items-center justify-center border-2 bg-rose-500 text-white shadow-[2px_2px_0_var(--ink)] hover:bg-rose-600"
                      >
                        <X className="h-4 w-4 stroke-3" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor={`image-upload-${fieldId}`}
                      className="border-ink mt-2 flex cursor-pointer flex-col items-center justify-center border-2 border-dashed bg-zinc-50 p-6 text-center shadow-[4px_4px_0_var(--ink)] transition-colors hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/60"
                    >
                      <div className="border-ink bg-accent/20 flex h-10 w-10 items-center justify-center border-2">
                        <ImagePlus className="text-accent h-5 w-5" />
                      </div>
                      <span className="mt-2 text-xs font-bold uppercase">
                        Click or Drag Image to Upload
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        PNG, JPG, or WEBP (Max 5MB)
                      </span>
                      <input
                        id={`image-upload-${fieldId}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleItemImageChange(fieldId, e)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add Another Item Button */}
          <button
            type="button"
            onClick={() => {
              const nextIndex = fields.length;
              append({ name: '', requirements: '', description: '' });
              requestAnimationFrame(() => {
                const target = document.getElementById(`items.${nextIndex}.name`);
                if (target) {
                  target.focus();
                  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              });
            }}
            className={cn(
              CONBLOCK,
              'border-ink inline-flex w-full cursor-pointer items-center justify-center gap-2 border-2 border-dashed bg-zinc-50 px-4 py-3 text-xs font-bold text-zinc-800 uppercase transition-all hover:bg-zinc-100 dark:bg-zinc-800/60 dark:text-zinc-200 dark:hover:bg-zinc-800'
            )}
          >
            <Plus className="text-accent h-4 w-4 stroke-3" />
            Add Another Freebie from this Vendor
          </button>
        </div>

        {/* Submit Actions */}
        <div className="border-ink flex items-center justify-end gap-3 border-t-2 pt-5">
          <Link
            href={`/conventions/${conventionSlug}/freebies`}
            className={cn(CONBLOCK, 'px-5 py-2.5 text-xs font-bold uppercase')}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={Boolean(submittingProgress) || createMutation.isPending}
            className={cn(
              CONBLOCK_PRIMARY,
              'inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase'
            )}
          >
            {submittingProgress ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {submittingProgress}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Post {fields.length === 1 ? 'Freebie' : `${fields.length} Freebies`}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
