import { OfficialSiteButton } from './OfficialSiteButton';
import { ViewOnMapButton } from './ViewOnMapButton';
import { cn } from '@/shared/lib/utils';

export interface ConventionExternalLinksProps {
  websiteUrl?: string | null;
  mapUrl?: string | null;
  variant?: 'icon' | 'full';
  className?: string;
}

export function ConventionExternalLinks({
  websiteUrl,
  mapUrl,
  variant = 'icon',
  className,
}: ConventionExternalLinksProps) {
  if (!websiteUrl && !mapUrl) return null;

  return (
    <div
      className={cn(
        variant === 'full' ? 'flex flex-col gap-2' : 'flex items-center gap-2',
        className
      )}
    >
      <OfficialSiteButton url={websiteUrl} variant={variant} />
      <ViewOnMapButton url={mapUrl} variant={variant} />
    </div>
  );
}
