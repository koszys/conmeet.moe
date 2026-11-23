import { cn } from '@/shared/lib/utils';

export interface ThreadBranchProps {
  isLast: boolean;
  index: number;
  isInteractive?: boolean;
  isHovered?: boolean;
  onCollapse?: () => void;
  onHoverChange?: (hovered: boolean) => void;
}

/**
 * Connecting branch from parent trunk to child comment:
 * - Unified L-curve for final reply in branch (zero runoff).
 * - Fused T-junction for intermediate replies.
 */
export function ThreadBranch({
  isLast,
  index,
  isInteractive = false,
  isHovered = false,
  onCollapse,
  onHoverChange,
}: ThreadBranchProps) {
  const topOffset = index === 0 ? '-top-2.5' : '-top-2';
  const lCurveHeight = index === 0 ? 'h-[calc(23px+0.625rem)]' : 'h-[calc(23px+0.5rem)]';

  if (isLast) {
    if (isInteractive && onCollapse) {
      return (
        <button
          type="button"
          onClick={onCollapse}
          onMouseEnter={() => onHoverChange?.(true)}
          onMouseLeave={() => onHoverChange?.(false)}
          className={cn(
            'group/line absolute z-10 cursor-pointer transition-colors select-none focus:outline-none',
            'rounded-bl-md border-b-2 border-l-2',
            '-left-[1px] w-[22px]',
            topOffset,
            lCurveHeight,
            isHovered
              ? 'border-accent-pop'
              : 'hover:border-accent-pop border-zinc-300 dark:border-zinc-700'
          )}
          title="Click threadline to collapse"
          aria-label="Click threadline to collapse"
        />
      );
    }

    return (
      <div
        className={cn(
          'pointer-events-none absolute z-10 select-none',
          'rounded-bl-md border-b-2 border-l-2 border-zinc-300 dark:border-zinc-700',
          '-left-[1px] w-[22px]',
          topOffset,
          lCurveHeight
        )}
        aria-hidden="true"
      />
    );
  }

  return (
    <>
      {isInteractive && onCollapse ? (
        <button
          type="button"
          onClick={onCollapse}
          onMouseEnter={() => onHoverChange?.(true)}
          onMouseLeave={() => onHoverChange?.(false)}
          className={cn(
            'group/line absolute left-0 z-10 flex w-4 -translate-x-1/2 cursor-pointer justify-center select-none focus:outline-none',
            topOffset,
            '-bottom-2'
          )}
          title="Click threadline to collapse"
          aria-label="Click threadline to collapse"
        >
          <span
            className={cn(
              'h-full transition-colors',
              isHovered
                ? 'bg-accent-pop w-[2px]'
                : 'group-hover/line:bg-accent-pop w-[2px] bg-zinc-300 dark:bg-zinc-700'
            )}
          />
        </button>
      ) : (
        <div
          className={cn(
            'pointer-events-none absolute left-0 z-10 flex w-4 -translate-x-1/2 justify-center select-none',
            topOffset,
            '-bottom-2'
          )}
          aria-hidden="true"
        >
          <span className="h-full w-[2px] bg-zinc-300 dark:bg-zinc-700" />
        </div>
      )}
      <span
        className={cn(
          'pointer-events-none absolute top-[22px] -left-[1px] z-10 h-[2px] w-[22px] -translate-y-1/2 transition-colors',
          isInteractive && isHovered ? 'bg-accent-pop' : 'bg-zinc-300 dark:bg-zinc-700'
        )}
        aria-hidden="true"
      />
    </>
  );
}
