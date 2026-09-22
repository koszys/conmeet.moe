import Image from 'next/image';
import { cn } from '@/shared/lib/utils';
import { CONBLOCK } from '@/shared/components/ui/button';
import discordLogo from '@/assets/social/discordlogo.png';
import kofiLogo from '@/assets/social/kofilogo.webp';

const SOCIALS = {
  discord: {
    label: 'Discord',
    href: '#',
    image: discordLogo,
    backgroundColor: '#5865F2',
  },
  kofi: {
    label: 'Ko-fi',
    href: 'https://ko-fi.com/koszy',
    image: kofiLogo,
    backgroundColor: '#FF6433',
  },
} as const;

export type SocialPlatform = keyof typeof SOCIALS;

const IMAGE_CLASSES: Record<SocialPlatform, string> = {
  discord: 'brightness-0 invert',
  kofi: '',
};

export function SocialButton({
  platform,
  href,
  disabled,
  className,
}: {
  platform: SocialPlatform;
  href?: string;
  disabled?: boolean;
  className?: string;
}) {
  if (disabled) return null;

  const { label, href: defaultHref, image, backgroundColor } = SOCIALS[platform];

  return (
    <a
      href={href ?? defaultHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        CONBLOCK,
        'inline-flex h-10 w-10 items-center justify-center rounded-none',
        className
      )}
      style={{ backgroundColor }}
    >
      <Image src={image} alt="" width={20} height={20} className={IMAGE_CLASSES[platform]} />
    </a>
  );
}
