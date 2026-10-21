import { Globe } from 'lucide-react';
import { CONBLOCK_PRIMARY } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export interface OfficialSiteButtonProps {
  url?: string | null;
  variant?: 'icon' | 'full' | 'responsive';
  className?: string;
  title?: string;
}

export function OfficialSiteButton({
  url,
  variant = 'icon',
  className,
  title = 'Official site',
}: OfficialSiteButtonProps) {
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
          CONBLOCK_PRIMARY,
          'inline-flex h-8 w-8 shrink-0 items-center justify-center border-2 p-0 text-xs transition-all @min-[680px]:w-auto @min-[680px]:gap-2 @min-[680px]:px-3',
          className
        )}
      >
        <Globe className="h-4 w-4 shrink-0" />
        <span className="hidden @min-[680px]:inline">Official site</span>
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
          CONBLOCK_PRIMARY,
          'inline-flex items-center justify-center gap-2 px-4 py-2.5',
          className
        )}
      >
        <Globe className="h-4 w-4" />
        Official site
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
        'border-ink bg-accent hover:bg-accent-pop flex h-9 w-9 cursor-pointer items-center justify-center border-2 text-white shadow-[1px_1px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none dark:text-zinc-950 dark:hover:text-white',
        className
      )}
    >
      <Globe className="h-4 w-4" />
    </a>
  );
}
