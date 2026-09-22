'use client';

import type { RefObject } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '@/app/_providers';
import { SocialButton } from '@/shared/components/ui/SocialButton';
import { IconButton } from '@/shared/components/ui/button';
import { HeaderSearch } from '@/features/conventions';
import { AccountButton } from './AccountButton';

export function HeaderActions({
  isConventionPage,
  menuOpen,
  onMenuToggle,
  onAccountToggle,
  headerUserWrap,
}: {
  isConventionPage: boolean;
  menuOpen: boolean;
  onMenuToggle: () => void;
  onAccountToggle: () => void;
  headerUserWrap: RefObject<HTMLDivElement | null>;
}) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      {!isConventionPage && <HeaderSearch />}
      <IconButton
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className="max-[500px]:hidden"
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </IconButton>
      <SocialButton platform="kofi" className="hidden min-[450px]:inline-flex" />
      <div ref={headerUserWrap} className="hidden min-[400px]:block">
        <AccountButton onToggle={onAccountToggle} />
      </div>
      <IconButton
        onClick={onMenuToggle}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        className="md:hidden"
      >
        {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </IconButton>
    </div>
  );
}
