'use client';

import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import type { FreebieItemFormValues, MultiFreebieFormValues } from './schema';
import { CharCounter } from './CharCounter';
import { ItemImageUpload } from './ItemImageUpload';

interface FreebieItemCardProps {
  fieldId: string;
  index: number;
  totalItems: number;
  itemVal: { name?: string; requirements?: string; description?: string };
  itemErrors?: FieldErrors<FreebieItemFormValues>;
  currentImage?: { file: File; preview: string };
  register: UseFormRegister<MultiFreebieFormValues>;
  onRemoveItem: (index: number) => void;
  onImageChange: (fieldId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: (fieldId: string) => void;
}

export function FreebieItemCard({
  fieldId,
  index,
  totalItems,
  itemVal,
  itemErrors,
  currentImage,
  register,
  onRemoveItem,
  onImageChange,
  onImageRemove,
}: FreebieItemCardProps) {
  return (
    <div className="border-ink space-y-4 border-2 bg-white p-4 shadow-[3px_3px_0_var(--ink)] sm:p-5 dark:bg-zinc-900">
      {/* Item Card Header */}
      <div className="border-ink flex items-center justify-between border-b-2 border-dashed pb-2.5">
        <span className="font-display text-xs tracking-wider text-zinc-900 uppercase dark:text-zinc-100">
          Freebie #{index + 1}
        </span>
        {totalItems > 1 && (
          <button
            type="button"
            onClick={() => onRemoveItem(index)}
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
            className="font-display block text-xs tracking-wider uppercase"
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
      <ItemImageUpload
        fieldId={fieldId}
        itemIndex={index}
        currentImage={currentImage}
        onImageChange={onImageChange}
        onImageRemove={onImageRemove}
      />
    </div>
  );
}
