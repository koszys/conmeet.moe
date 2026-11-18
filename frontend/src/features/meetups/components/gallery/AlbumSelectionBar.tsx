'use client';

import { CheckSquare, Download, Loader2 } from 'lucide-react';
import { CONBLOCK_PRIMARY, CONBLOCK_SECONDARY } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';

export interface AlbumSelectionBarProps {
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  onToggleSelectAll: () => void;
  onDownload: () => void;
  isPackaging?: boolean;
  onDone: () => void;
}

export function AlbumSelectionBar({
  selectedCount,
  totalCount,
  isAllSelected,
  onToggleSelectAll,
  onDownload,
  isPackaging = false,
  onDone,
}: AlbumSelectionBarProps) {
  return (
    <div className="border-ink animate-in fade-in slide-in-from-bottom-4 fixed inset-x-4 bottom-6 z-40 mx-auto max-w-xl border-2 bg-white/95 p-3 shadow-[6px_6px_0_var(--ink)] backdrop-blur-md transition-all sm:px-5 sm:py-3.5 dark:bg-zinc-900/95">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Count Badge & Select All */}
        <div className="flex items-center gap-2">
          <div className="border-ink flex items-center gap-1.5 border-2 bg-zinc-100 px-2.5 py-1 text-xs font-bold shadow-[1px_1px_0_var(--ink)] dark:bg-zinc-800">
            <CheckSquare className="text-accent h-3.5 w-3.5 shrink-0" />
            <span className="font-mono">
              {selectedCount} / {totalCount}
            </span>
            <span className="font-display hidden tracking-wider uppercase sm:inline">Selected</span>
          </div>

          <button
            type="button"
            onClick={onToggleSelectAll}
            className={cn(
              CONBLOCK_SECONDARY,
              'px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase'
            )}
          >
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {/* Right: Download & Done */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDownload}
            disabled={selectedCount === 0 || isPackaging}
            className={cn(
              CONBLOCK_PRIMARY,
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-wider uppercase disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {isPackaging ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Packaging...</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span>Download{selectedCount > 0 ? ` (${selectedCount})` : ''}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onDone}
            className={cn(
              CONBLOCK_SECONDARY,
              'px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase'
            )}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
