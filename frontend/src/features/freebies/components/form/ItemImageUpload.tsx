'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Undo2, X } from 'lucide-react';
import { CONBLOCK } from '@/shared/components/ui/button';
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
      <div className="flex items-center justify-between">
        <span className="font-display block text-xs tracking-wider uppercase">{label}</span>
        {previewUrl ? (
          <span className="font-mono text-[10px] font-bold text-teal-600 uppercase dark:text-teal-400">
            Attached
          </span>
        ) : null}
      </div>

      {previewUrl ? (
        <div className="border-ink relative mt-1.5 w-full max-w-lg overflow-hidden border-2 bg-zinc-950 shadow-[4px_4px_0_var(--ink)]">
          {/* Image Canvas */}
          <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-contain"
              unoptimized={previewUrl.startsWith('blob:')}
            />
          </div>

          {/* Action Toolbar */}
          <div className="border-ink flex items-center justify-between border-t-2 bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-300">
              <ImagePlus className="text-accent h-3.5 w-3.5 shrink-0" />
              <span className="font-bold tracking-wider uppercase">Photo attached</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  CONBLOCK,
                  'flex h-7 items-center bg-white px-2.5 text-[10px] font-bold uppercase hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700'
                )}
                title="Replace image"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={onRemove}
                className={cn(
                  CONBLOCK,
                  'flex h-7 w-7 items-center justify-center bg-white text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700'
                )}
                title="Remove image"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
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
            <div className="border-ink mt-2 mb-2 flex items-center justify-between border-2 border-dashed bg-amber-50/60 p-2.5 shadow-[2px_2px_0_var(--ink)] dark:border-zinc-700 dark:bg-amber-950/20">
              <span className="text-xs text-zinc-600 italic dark:text-zinc-300">{undoMessage}</span>
              <button
                type="button"
                onClick={onUndoRemove}
                className="inline-flex cursor-pointer items-center gap-1 font-mono text-xs font-bold text-teal-600 hover:underline dark:text-teal-400"
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
              'border-ink group mt-1.5 flex cursor-pointer flex-col items-center justify-center border-2 border-dashed bg-zinc-50/70 p-5 text-center shadow-[2px_2px_0_var(--ink)] transition-all hover:bg-zinc-100 sm:flex-row sm:justify-between sm:p-4 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/60',
              isDragging && 'border-accent bg-accent/15'
            )}
          >
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <div className="border-ink bg-accent/20 flex h-10 w-10 shrink-0 items-center justify-center border-2 shadow-[2px_2px_0_var(--ink)] transition-transform group-hover:scale-105">
                <ImagePlus className="text-accent h-5 w-5" />
              </div>
              <div className="text-center sm:text-left">
                <span className="font-display block text-xs font-bold tracking-wider text-zinc-900 uppercase dark:text-zinc-100">
                  Click or drag image to upload
                </span>
                <span className="mt-0.5 block text-[11px] text-zinc-500 dark:text-zinc-400">
                  PNG, JPG, or WEBP (Max 5MB)
                </span>
              </div>
            </div>
            <span
              className={cn(
                CONBLOCK,
                'mt-3 shrink-0 bg-white px-3 py-1.5 text-[10px] font-bold uppercase sm:mt-0 dark:bg-zinc-800 dark:text-zinc-100'
              )}
            >
              Choose File
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
