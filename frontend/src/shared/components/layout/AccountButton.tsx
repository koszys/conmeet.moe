'use client';

import Link from 'next/link';
import { UserRound } from 'lucide-react';
import { useAuth } from '@/features/auth/auth-provider';
import { IconButton, iconButtonClasses } from '@/shared/components/ui/button';

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
      {user.avatar_url ? (
        <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
      ) : (
        <UserRound className="h-4 w-4" />
      )}
    </IconButton>
  );
}
