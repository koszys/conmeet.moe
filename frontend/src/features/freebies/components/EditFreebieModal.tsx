'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Check, ImagePlus, Loader2, RotateCw, Undo2, X } from 'lucide-react';
import { CONBLOCK, CONBLOCK_PRIMARY } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import type { Freebie } from '../types';
import { useUpdateFreebie } from '../api/mutations';
import { CharCounter, useVendorSuggestions, VendorSuggestDropdown } from './form';

interface EditFreebieModalProps {
  freebie: Freebie;
  isOpen: boolean;
  onClose: () => void;
}

const emptySubscribe = () => () => {};

export function EditFreebieModal({ freebie, isOpen, onClose }: EditFreebieModalProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isMounted || !isOpen) return null;

  return createPortal(
    <EditFreebieModalDialog key={freebie.id} freebie={freebie} onClose={onClose} />,
    document.body
  );
}

function EditFreebieModalDialog({ freebie, onClose }: { freebie: Freebie; onClose: () => void }) {
  const updateMutation = useUpdateFreebie();

  // Form field state initialized directly from props
  const [vendorName, setVendorName] = useState(freebie.vendor.name);
  const [name, setName] = useState(freebie.name);
  const [location, setLocation] = useState(freebie.location || '');
  const [requirements, setRequirements] = useState(freebie.requirements || '');
  const [description, setDescription] = useState(freebie.description || '');
  const [showAllVendorPills, setShowAllVendorPills] = useState(false);

  // Photo state
  const [clearImage, setClearImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Errors & UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle escape key and lock body scroll
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !updateMutation.isPending) {
        onClose();
      }
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, updateMutation.isPending]);

  // Shared vendor search, suggestions, and known booths
  const conventionSlug = freebie.convention_slug || undefined;
  const suggestions = useVendorSuggestions({
    conventionSlug,
    selectedVendorName: vendorName,
    firstItemLocation: location,
    onSelectVendor: (canonicalName, autoLocation) => {
      setVendorName(canonicalName);
      if (autoLocation) {
        setLocation(autoLocation);
      } else if (suggestions.autoFilledFromVendor) {
        setLocation('');
      }
    },
    focusNextElementId: 'edit_item_name',
  });
  const knownBooths = suggestions.knownBooths;

  function handleFileSelect(file: File) {
    if (!file.type.startsWith('image/')) return;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setClearImage(false);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }

  function handleRemovePhoto() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setImageFile(null);
    setClearImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleUndoRemovePhoto() {
    setClearImage(false);
  }

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!vendorName.trim()) {
      nextErrors.vendorName = 'Vendor / company name is required';
    } else if (vendorName.trim().length > 50) {
      nextErrors.vendorName = 'Max 50 characters';
    }

    if (!name.trim()) {
      nextErrors.name = 'Item name is required';
    } else if (name.trim().length < 2) {
      nextErrors.name = 'Item name must be at least 2 characters';
    } else if (name.trim().length > 60) {
      nextErrors.name = 'Max 60 characters';
    }

    if (!location.trim()) {
      nextErrors.location = 'Booth / hall location is required';
    } else if (location.trim().length > 50) {
      nextErrors.location = 'Max 50 characters';
    }

    if (!requirements.trim()) {
      nextErrors.requirements = 'Requirements are required';
    } else if (requirements.trim().length > 200) {
      nextErrors.requirements = 'Max 200 characters';
    }

    if (description && description.trim().length > 300) {
      nextErrors.description = 'Max 300 characters';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setServerError(null);

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('vendor_name', vendorName.trim());
    formData.append('location', location.trim());
    formData.append('requirements', requirements.trim());
    formData.append('description', description.trim());

    if (imageFile) {
      formData.append('image', imageFile);
    } else if (clearImage) {
      formData.append('clear_image', 'true');
    }

    try {
      await updateMutation.mutateAsync({ freebieId: freebie.id, formData });
      onClose();
    } catch {
      setServerError('Failed to save changes. Please check your inputs and try again.');
    }
  }

  const currentDisplayPhoto =
    previewUrl || (!clearImage ? freebie.image_thumb || freebie.image : null);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-freebie-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={() => {
        if (!updateMutation.isPending) onClose();
      }}
    >
      <div
        className="border-ink flex max-h-[92vh] w-full max-w-xl flex-col border-2 bg-white shadow-[6px_6px_0_var(--ink)] dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="border-ink flex items-center justify-between border-b-2 p-4 sm:px-6">
          <div>
            <h2
              id="edit-freebie-title"
              className="font-display text-base tracking-wide uppercase sm:text-lg dark:text-zinc-100"
            >
              Edit Freebie Drop
            </h2>
            <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              Update booth location, requirements, or photos for this drop.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={updateMutation.isPending}
            className="border-ink flex h-8 w-8 cursor-pointer items-center justify-center border text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4">
            {serverError ? (
              <div className="border-ink border-2 bg-rose-50 p-3 text-xs font-bold text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
                {serverError}
              </div>
            ) : null}

            {/* Vendor Name */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="edit_vendor_name"
                  className="font-display block text-xs tracking-wider uppercase"
                >
                  Vendor / Company Name <span className="text-accent">*</span>
                </label>
                <CharCounter current={vendorName.length} max={50} />
              </div>

              <div className="relative mt-1.5" ref={suggestions.inputWrapRef}>
                <input
                  id="edit_vendor_name"
                  type="text"
                  autoComplete="off"
                  maxLength={50}
                  value={vendorName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setVendorName(val);
                    if (!suggestions.isSuggestOpen) suggestions.setIsSuggestOpen(true);
                    suggestions.setHighlightedIndex(-1);

                    const trimmed = val.trim();
                    const match = suggestions.combinedVendors.find(
                      (v) => v.name.toLowerCase() === trimmed.toLowerCase()
                    );
                    if (match) {
                      const knownLocs =
                        suggestions.vendorLocationsMap.get(match.name.toLowerCase()) || [];
                      if (knownLocs.length > 0) {
                        setLocation(knownLocs[0]);
                        suggestions.setAutoFilledFromVendor(match.name);
                      }
                    }
                  }}
                  onFocus={() => suggestions.setIsSuggestOpen(true)}
                  onKeyDown={suggestions.handleVendorKeyDown}
                  placeholder="e.g. HoYoverse, Good Smile Company"
                  className="border-ink focus:ring-accent h-10 w-full border-2 bg-white pr-9 pl-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
                />

                {/* Instant Clear Button */}
                {vendorName ? (
                  <button
                    type="button"
                    onClick={() => {
                      setVendorName('');
                      if (suggestions.autoFilledFromVendor) {
                        setLocation('');
                        suggestions.setAutoFilledFromVendor(null);
                      }
                      suggestions.setIsSuggestOpen(false);
                      suggestions.setHighlightedIndex(-1);
                    }}
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    title="Clear vendor name"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}

                {/* Auto-suggest Dropdown */}
                {suggestions.isSuggestOpen && (
                  <VendorSuggestDropdown
                    filteredSuggestions={suggestions.filteredSuggestions}
                    selectedVendorName={vendorName}
                    highlightedIndex={suggestions.highlightedIndex}
                    suggestListRef={suggestions.suggestListRef}
                    onSelectVendor={suggestions.handleSelectVendor}
                    onHighlightIndex={suggestions.setHighlightedIndex}
                  />
                )}
              </div>

              {errors.vendorName ? (
                <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                  {errors.vendorName}
                </p>
              ) : null}

              {/* Quick select existing vendors with toggle-to-unselect and +X more expansion */}
              {suggestions.conventionVendors && suggestions.conventionVendors.length > 0 ? (
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="block text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-300">
                      Existing at this con ({suggestions.conventionVendors.length}):
                    </span>
                    <button
                      type="button"
                      onClick={() => suggestions.refreshVendors()}
                      disabled={suggestions.isRefreshingVendors}
                      title="Refresh vendors and booth locations"
                      aria-label="Refresh vendors and booth locations"
                      className="inline-flex cursor-pointer items-center gap-1 text-[10px] font-bold tracking-wider text-zinc-500 uppercase transition-colors hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                      <RotateCw
                        className={cn(
                          'h-3 w-3',
                          suggestions.isRefreshingVendors && 'text-accent animate-spin'
                        )}
                      />
                      <span>{suggestions.isRefreshingVendors ? 'Syncing…' : 'Refresh'}</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(showAllVendorPills
                      ? suggestions.conventionVendors
                      : suggestions.conventionVendors.slice(0, 8)
                    ).map((v) => {
                      const isSelected = vendorName.trim().toLowerCase() === v.name.toLowerCase();
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            suggestions.handleSelectVendor(v.name, {
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
                    {suggestions.conventionVendors.length > 8 && (
                      <button
                        type="button"
                        onClick={() => setShowAllVendorPills((prev) => !prev)}
                        className="cursor-pointer text-[10px] font-bold text-zinc-500 underline dark:text-zinc-400"
                      >
                        {showAllVendorPills
                          ? 'Show less'
                          : `+${suggestions.conventionVendors.length - 8} more`}
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Item Name */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="edit_item_name"
                  className="font-display block text-xs tracking-wider uppercase"
                >
                  Item Name <span className="text-accent">*</span>
                </label>
                <CharCounter current={name.length} max={60} />
              </div>
              <input
                id="edit_item_name"
                type="text"
                maxLength={60}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Genshin Impact Acrylic Standee"
                className="border-ink focus:ring-accent mt-1.5 h-10 w-full border-2 bg-white px-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
              />
              {errors.name ? (
                <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                  {errors.name}
                </p>
              ) : null}
            </div>

            {/* Booth / Hall Location */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="edit_location"
                  className="font-display block text-xs tracking-wider uppercase"
                >
                  Booth / Hall Location <span className="text-accent">*</span>
                </label>
                <CharCounter current={location.length} max={50} />
              </div>
              <input
                id="edit_location"
                type="text"
                maxLength={50}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Booth #1420, Hall B #204"
                className="border-ink focus:ring-accent mt-1.5 h-10 w-full border-2 bg-white px-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
              />
              {errors.location ? (
                <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                  {errors.location}
                </p>
              ) : null}

              {/* Known Booths Pill Selector with matching wording and newline list */}
              {knownBooths.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                      Known booth{knownBooths.length > 1 ? 's' : ''} ({knownBooths.length}):
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                      Click to select
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {knownBooths.map((booth) => {
                      const isSelected = location.trim().toLowerCase() === booth.toLowerCase();

                      return (
                        <button
                          key={booth}
                          type="button"
                          onClick={() => setLocation(isSelected ? '' : booth)}
                          title={
                            isSelected
                              ? 'Click to unselect this booth'
                              : 'Click to select this booth'
                          }
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

            {/* Requirements */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="edit_requirements"
                  className="font-display block text-xs tracking-wider uppercase"
                >
                  How to Get It (Requirements) <span className="text-accent">*</span>
                </label>
                <CharCounter current={requirements.length} max={200} />
              </div>
              <textarea
                id="edit_requirements"
                rows={2}
                maxLength={200}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="e.g. Follow @HoYoverse on X and show badge"
                className="border-ink focus:ring-accent mt-1.5 w-full border-2 bg-white p-2.5 text-sm font-medium text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
              />
              {errors.requirements ? (
                <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                  {errors.requirements}
                </p>
              ) : null}
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="edit_description"
                  className="font-display block text-xs tracking-wider uppercase"
                >
                  Additional Details / Notes
                </label>
                <CharCounter current={description.length} max={300} />
              </div>
              <textarea
                id="edit_description"
                rows={2}
                maxLength={300}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Drops start at 11:00 AM, limited to 100/day"
                className="border-ink focus:ring-accent mt-1.5 w-full border-2 bg-white p-2.5 text-sm font-medium text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
              />
              {errors.description ? (
                <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                  {errors.description}
                </p>
              ) : null}
            </div>

            {/* Photo Management */}
            <div>
              <span className="font-display block text-xs tracking-wider uppercase">
                Photo of Item (Optional)
              </span>

              {currentDisplayPhoto ? (
                <div className="border-ink relative mt-2 aspect-video w-full max-w-sm overflow-hidden border-2 bg-zinc-100 shadow-[4px_4px_0_var(--ink)] dark:bg-zinc-800">
                  <Image
                    src={currentDisplayPhoto}
                    alt="Freebie preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-ink flex h-7 cursor-pointer items-center border-2 bg-white px-2 text-[10px] font-bold uppercase shadow-[2px_2px_0_var(--ink)] hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                      title="Replace image"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="border-ink flex h-7 w-7 cursor-pointer items-center justify-center border-2 bg-rose-500 text-white shadow-[2px_2px_0_var(--ink)] hover:bg-rose-600"
                      title="Remove image"
                    >
                      <X className="h-4 w-4 stroke-3" />
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <>
                  {clearImage && freebie.image ? (
                    <div className="mt-2 mb-2 flex items-center justify-between border border-dashed border-zinc-300 p-2.5 dark:border-zinc-700">
                      <span className="text-xs text-zinc-500 italic dark:text-zinc-400">
                        Photo will be removed upon saving
                      </span>
                      <button
                        type="button"
                        onClick={handleUndoRemovePhoto}
                        className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-teal-600 hover:underline dark:text-teal-400"
                      >
                        <Undo2 className="h-3.5 w-3.5" />
                        Undo
                      </button>
                    </div>
                  ) : null}

                  <label
                    htmlFor="edit_image_upload"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                      'border-ink mt-2 flex cursor-pointer flex-col items-center justify-center border-2 border-dashed bg-zinc-50 p-6 text-center shadow-[4px_4px_0_var(--ink)] transition-colors hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/60',
                      isDragging && 'border-accent bg-accent/15'
                    )}
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
                      id="edit_image_upload"
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="border-ink mt-6 flex items-center justify-end gap-2.5 border-t-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className={cn(CONBLOCK, 'px-4 py-2 text-xs font-bold uppercase')}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className={cn(
                CONBLOCK_PRIMARY,
                'inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold uppercase'
              )}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 stroke-3" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
