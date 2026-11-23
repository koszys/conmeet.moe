import type { Ref } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button, CONBLOCK_PRIMARY, CONBLOCK_SECONDARY } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  siblingCount?: number;
  ref?: Ref<HTMLElement>;
}

function getPaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number = 1
): (number | 'dots')[] {
  // Total numbers shown = siblingCount (left) + siblingCount (right) + 1 (current) + 2 (first + last) + 2 (dots)
  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, 'dots', totalPages];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i + 1
    );
    return [1, 'dots', ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i
  );
  return [1, 'dots', ...middleRange, 'dots', totalPages];
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  siblingCount = 1,
  ref,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getPaginationRange(currentPage, totalPages, siblingCount);
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <nav
      ref={ref}
      data-pagination
      aria-label="Pagination"
      className={cn('relative flex items-center justify-center gap-2 pt-2', className)}
    >
      {/* Mobile view */}
      <div className="flex w-full items-center justify-center gap-3 sm:hidden">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canPrev}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Prev</span>
        </Button>

        <span className="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canNext}
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Desktop / tablet view */}
      <div className="hidden sm:flex sm:items-center sm:gap-1.5">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canPrev}
          aria-label="Previous page"
          className="h-8 px-2.5"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Prev</span>
        </Button>

        {pages.map((item, index) => {
          if (item === 'dots') {
            return (
              <span
                key={`dots-${index}`}
                className="px-1 text-xs font-bold tracking-widest text-zinc-400 select-none dark:text-zinc-600"
              >
                ...
              </span>
            );
          }

          const isCurrent = item === currentPage;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={isCurrent ? 'page' : undefined}
              className={cn(
                'inline-flex h-8 min-w-8 items-center justify-center px-2 font-mono text-xs font-bold transition-all',
                isCurrent ? CONBLOCK_PRIMARY : CONBLOCK_SECONDARY
              )}
            >
              {item}
            </button>
          );
        })}

        <Button
          size="sm"
          variant="secondary"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canNext}
          aria-label="Next page"
          className="h-8 px-2.5"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
