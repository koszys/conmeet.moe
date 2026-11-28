'use client';

import Link from 'next/link';
import { UserRound } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { IconButton, iconButtonClasses, UserAvatar } from '@/shared/components/ui';

export function AccountButton({ onToggle }: { onToggle: () => void }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <Link href="/login" aria-label="Login" className={iconButtonClasses()}>
        <UserRound className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <IconButton onClick={onToggle} aria-label="Account menu" className="flex overflow-hidden">
      <UserAvatar
        src={user.avatar_url}
        framed={false}
        className="h-full w-full"
        iconClassName="text-current"
      />
    </IconButton>
  );
}
