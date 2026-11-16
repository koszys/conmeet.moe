import { MapPin } from 'lucide-react';
import { CONBLOCK_SECONDARY } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';

export interface ViewOnMapButtonProps {
  url?: string | null;
  variant?: 'icon' | 'full' | 'responsive';
  className?: string;
  title?: string;
}

export function ViewOnMapButton({
  url,
  variant = 'icon',
  className,
  title = 'View on map',
}: ViewOnMapButtonProps) {
  if (!url) return null;

  if (variant === 'responsive') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={title}
        title={title}
        className={cn(
          CONBLOCK_SECONDARY,
          'inline-flex h-8 w-8 shrink-0 items-center justify-center p-0 text-xs font-bold tracking-widest uppercase @min-[680px]:w-auto @min-[680px]:gap-2 @min-[680px]:px-3',
          className
        )}
      >
        <MapPin className="h-4 w-4 shrink-0" />
        <span className="hidden @min-[680px]:inline">View on map</span>
      </a>
    );
  }

  if (variant === 'full') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          CONBLOCK_SECONDARY,
          'inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold tracking-widest uppercase',
          className
        )}
      >
        <MapPin className="h-4 w-4" />
        View on map
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={title}
      title={title}
      className={cn(
        CONBLOCK_SECONDARY,
        'flex h-9 w-9 shrink-0 items-center justify-center shadow-[1px_1px_0_var(--ink)]',
        className
      )}
    >
      <MapPin className="h-4 w-4" />
    </a>
  );
}
