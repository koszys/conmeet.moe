import { Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { MikuSilhouette } from '@/shared/components/miku/MikuSilhouette';

const BRAND_BOX = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
} as const;

const BRAND_MIKU = {
  sm: 'h-5 w-auto',
  md: 'h-6 w-auto',
  lg: 'h-8 w-auto',
} as const;

const BRAND_SPARKLE = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
} as const;

export function BrandMark({
  size = 'md',
  withSparkles = false,
  className,
  boxClassName,
}: {
  size?: keyof typeof BRAND_BOX;
  withSparkles?: boolean;
  className?: string;
  boxClassName?: string;
}) {
  return (
    <span className={cn('flex items-center', className)}>
      <span
        className={cn(
          'border-ink bg-accent flex -rotate-6 items-center justify-center overflow-hidden rounded-sm border-2 shadow-[2px_2px_0_var(--ink)] transition-transform group-hover:-rotate-12',
          BRAND_BOX[size],
          boxClassName
        )}
      >
        <MikuSilhouette className={cn('-rotate-12 text-white', BRAND_MIKU[size])} />
      </span>
      {withSparkles && (
        <Sparkles
          className={cn(
            'text-accent rotate-12 transition-transform group-hover:rotate-45',
            BRAND_SPARKLE[size]
          )}
        />
      )}
    </span>
  );
}
