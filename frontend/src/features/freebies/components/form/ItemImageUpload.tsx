'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Undo2, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface ItemImageUploadProps {
  id?: string;
  label?: string;
  previewUrl?: string | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  canUndoRemove?: boolean;
  onUndoRemove?: () => void;
  undoMessage?: string;
}

export function ItemImageUpload({
  id = 'item_image_upload',
  label = 'Photo of Item (Optional)',
  previewUrl,
  onFileSelect,
  onRemove,
  canUndoRemove = false,
  onUndoRemove,
  undoMessage = 'Photo will be removed upon saving',
}: ItemImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
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
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  }

  return (
    <div>
      <span className="font-display block text-xs tracking-wider uppercase">{label}</span>

      {previewUrl ? (
        <div className="border-ink relative mt-2 aspect-video w-full max-w-sm overflow-hidden border-2 bg-zinc-100 shadow-[4px_4px_0_var(--ink)] dark:bg-zinc-800">
          <Image src={previewUrl} alt="Preview" fill className="object-cover" />
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
              onClick={onRemove}
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
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      ) : (
        <>
          {canUndoRemove && onUndoRemove ? (
            <div className="mt-2 mb-2 flex items-center justify-between border border-dashed border-zinc-300 p-2.5 dark:border-zinc-700">
              <span className="text-xs text-zinc-500 italic dark:text-zinc-400">{undoMessage}</span>
              <button
                type="button"
                onClick={onUndoRemove}
                className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-teal-600 hover:underline dark:text-teal-400"
              >
                <Undo2 className="h-3.5 w-3.5" />
                Undo
              </button>
            </div>
          ) : null}

          <label
            htmlFor={id}
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
            <span className="mt-2 text-xs font-bold uppercase">Click or Drag Image to Upload</span>
            <span className="text-[11px] text-zinc-600 dark:text-zinc-300">
              PNG, JPG, or WEBP (Max 5MB)
            </span>
            <input
              id={id}
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </label>
        </>
      )}
    </div>
  );
}
