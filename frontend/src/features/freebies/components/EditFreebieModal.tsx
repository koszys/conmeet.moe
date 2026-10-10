'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Check, Loader2, X } from 'lucide-react';
import { CONBLOCK, CONBLOCK_PRIMARY } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import type { Freebie } from '../types';
import { useUpdateFreebie } from '../api/mutations';
import {
  BoothLocationField,
  CharCounter,
  ItemImageUpload,
  useVendorSuggestions,
  VendorPicker,
} from './form';

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

  // Photo state
  const [clearImage, setClearImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Errors & UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

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
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setClearImage(false);
  }

  function handleRemovePhoto() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setImageFile(null);
    setClearImage(true);
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
            className="border-ink flex h-8 w-8 cursor-pointer items-center justify-center border text-zinc-700 hover:bg-zinc-100 hover:text-black dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white"
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
            <VendorPicker
              id="edit_vendor_name"
              value={vendorName}
              onChange={setVendorName}
              onLocationAutoFill={setLocation}
              error={errors.vendorName}
              suggestions={suggestions}
            />

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
                className="border-ink focus:ring-accent mt-1.5 h-10 w-full border-2 bg-white px-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:outline-none sm:h-11 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
              />
              {errors.name ? (
                <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                  {errors.name}
                </p>
              ) : null}
            </div>

            {/* Booth / Hall Location */}
            <BoothLocationField
              id="edit_location"
              value={location}
              onChange={setLocation}
              knownBooths={knownBooths}
              error={errors.location}
            />

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
            <ItemImageUpload
              id="edit_image_upload"
              label="Photo of Item (Optional)"
              previewUrl={currentDisplayPhoto}
              onFileSelect={handleFileSelect}
              onRemove={handleRemovePhoto}
              canUndoRemove={Boolean(clearImage && freebie.image)}
              onUndoRemove={handleUndoRemovePhoto}
            />
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
