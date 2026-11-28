'use client';

import { UserRound } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export type UserAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  size?: UserAvatarSize;
  framed?: boolean;
  className?: string;
  imgClassName?: string;
  iconClassName?: string;
}

const SIZE_CLASSES: Record<UserAvatarSize, { box: string; icon: string }> = {
  xs: { box: 'h-6 w-6', icon: 'h-3.5 w-3.5' },
  sm: { box: 'h-8 w-8', icon: 'h-4 w-4' },
  md: { box: 'h-12 w-12', icon: 'h-6 w-6' },
  lg: { box: 'h-16 w-16', icon: 'h-8 w-8' },
  xl: { box: 'h-24 w-24', icon: 'h-10 w-10' },
};

export function UserAvatar({
  src,
  alt = '',
  size = 'sm',
  framed = true,
  className,
  imgClassName,
  iconClassName,
}: UserAvatarProps) {
  const sizeConfig = SIZE_CLASSES[size];

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden',
        framed && 'border-ink border-2 bg-zinc-100 dark:bg-zinc-800',
        sizeConfig.box,
        className
      )}
    >
      {src ? (
        <img src={src} alt={alt} className={cn('h-full w-full object-cover', imgClassName)} />
      ) : (
        <UserRound
          className={cn('text-zinc-500 dark:text-zinc-400', sizeConfig.icon, iconClassName)}
        />
      )}
    </div>
  );
}
