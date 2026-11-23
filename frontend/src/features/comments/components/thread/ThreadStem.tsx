import { cn } from '@/shared/lib/utils';

export interface ThreadStemProps {
  isInteractive?: boolean;
  isHovered?: boolean;
  onCollapse?: () => void;
  onHoverChange?: (hovered: boolean) => void;
}

/**
 * Vertical stem rail directly underneath the avatar leading down to replies.
 */
export function ThreadStem({
  isInteractive = false,
  isHovered = false,
  onCollapse,
  onHoverChange,
}: ThreadStemProps) {
  if (isInteractive && onCollapse) {
    return (
      <button
        type="button"
        onClick={onCollapse}
        onMouseEnter={() => onHoverChange?.(true)}
        onMouseLeave={() => onHoverChange?.(false)}
        className="group/line mt-0 -mb-2.5 flex w-4 flex-1 cursor-pointer justify-center select-none focus:outline-none"
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
    );
  }

  return (
    <div className="mt-0 -mb-2.5 flex w-4 flex-1 justify-center select-none">
      <span className="h-full w-[2px] bg-zinc-300 dark:bg-zinc-700" />
    </div>
  );
}
