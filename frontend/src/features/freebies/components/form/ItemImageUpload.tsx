'use client';

import Image from 'next/image';
import { ImagePlus, X } from 'lucide-react';

interface ItemImageUploadProps {
  fieldId: string;
  itemIndex: number;
  currentImage?: { file: File; preview: string };
  onImageChange: (fieldId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: (fieldId: string) => void;
}

export function ItemImageUpload({
  fieldId,
  itemIndex,
  currentImage,
  onImageChange,
  onImageRemove,
}: ItemImageUploadProps) {
  return (
    <div>
      <span className="font-display block text-xs tracking-wider uppercase">
        Photo of Item #{itemIndex + 1} (Optional)
      </span>

      {currentImage ? (
        <div className="border-ink relative mt-2 aspect-video w-full max-w-sm overflow-hidden border-2 bg-zinc-100 shadow-[4px_4px_0_var(--ink)] dark:bg-zinc-800">
          <Image
            src={currentImage.preview}
            alt={`Preview #${itemIndex + 1}`}
            fill
            className="object-cover"
          />
          <button
            type="button"
            onClick={() => onImageRemove(fieldId)}
            className="border-ink absolute top-2 right-2 flex h-7 w-7 cursor-pointer items-center justify-center border-2 bg-rose-500 text-white shadow-[2px_2px_0_var(--ink)] hover:bg-rose-600"
            title="Remove image"
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
          <span className="mt-2 text-xs font-bold uppercase">Click or Drag Image to Upload</span>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            PNG, JPG, or WEBP (Max 5MB)
          </span>
          <input
            id={`image-upload-${fieldId}`}
            type="file"
            accept="image/*"
            onChange={(e) => onImageChange(fieldId, e)}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
