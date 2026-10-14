import { MapPin } from 'lucide-react';
import { CONBLOCK } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export interface ViewOnMapButtonProps {
  url?: string | null;
  variant?: 'icon' | 'full';
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

  if (variant === 'full') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          CONBLOCK,
          'text-ink hover:border-accent-pop hover:text-accent-pop inline-flex items-center justify-center gap-2 bg-white px-4 py-2.5 text-xs font-bold tracking-widest uppercase dark:bg-zinc-900 dark:text-zinc-100',
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
        'border-ink text-ink hover:border-accent-pop hover:text-accent-pop flex h-9 w-9 cursor-pointer items-center justify-center border-2 bg-white shadow-[1px_1px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-zinc-100 hover:shadow-none dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800',
        className
      )}
    >
      <MapPin className="h-4 w-4" />
    </a>
  );
}
