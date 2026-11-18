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
    <div className="border-ink animate-in fade-in slide-in-from-bottom-4 fixed inset-x-3 bottom-5 z-40 mx-auto max-w-xl border-2 bg-white/95 p-2.5 shadow-[6px_6px_0_var(--ink)] backdrop-blur-md transition-all sm:inset-x-4 sm:bottom-6 sm:p-3.5 dark:bg-zinc-900/95">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Count Badge & Select All */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="border-ink flex items-center gap-1.5 border-2 bg-zinc-100 px-2 py-1 text-xs font-bold shadow-[1px_1px_0_var(--ink)] dark:bg-zinc-800">
            <CheckSquare className="text-accent h-3.5 w-3.5 shrink-0" />
            <span className="font-mono">
              {selectedCount} / {totalCount}
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleSelectAll}
            className={cn(
              CONBLOCK_SECONDARY,
              'px-2 py-1 text-[11px] font-bold tracking-wider whitespace-nowrap uppercase sm:px-2.5'
            )}
          >
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {/* Right: Download & Done */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onDownload}
            disabled={selectedCount === 0 || isPackaging}
            className={cn(
              CONBLOCK_PRIMARY,
              'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold tracking-wider whitespace-nowrap uppercase disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:py-1.5'
            )}
          >
            {isPackaging ? (
              <>
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                <span>Packaging...</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5 shrink-0" />
                <span>
                  <span className="hidden min-[400px]:inline">Download </span>
                  {selectedCount > 0 ? `(${selectedCount})` : ''}
                </span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onDone}
            className={cn(
              CONBLOCK_SECONDARY,
              'px-2.5 py-1 text-xs font-bold tracking-wider uppercase sm:px-3.5 sm:py-1.5'
            )}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
