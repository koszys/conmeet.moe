'use client';

import { X } from 'lucide-react';
import { Button, type ButtonSizeVariant } from './Button';

export interface ClearFiltersButtonProps {
  onClear: () => void;
  label?: string;
  size?: ButtonSizeVariant;
  className?: string;
}

export function ClearFiltersButton({
  onClear,
  label = 'Clear Filters',
  size = 'md',
  className,
}: ClearFiltersButtonProps) {
  return (
    <Button variant="primary" size={size} onClick={onClear} className={className}>
      <X className="h-4 w-4" />
      <span>{label}</span>
    </Button>
  );
}
