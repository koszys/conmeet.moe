'use client';

import type { Freebie } from '../../types';
import { useDeleteFreebie } from '../../api/mutations';
import { ConfirmDeleteModal } from '@/shared/components/ui';

export interface DeleteFreebieModalProps {
  freebie: Freebie;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteFreebieModal({ freebie, isOpen, onClose }: DeleteFreebieModalProps) {
  const deleteMutation = useDeleteFreebie();

  async function handleConfirm() {
    await deleteMutation.mutateAsync(freebie.id);
    onClose();
  }

  return (
    <ConfirmDeleteModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      itemName={freebie.name}
      itemType="Freebie"
      isPending={deleteMutation.isPending}
      warningMessage={`Are you sure you want to delete "${freebie.name}"? This action cannot be undone and will permanently remove this freebie item from the community board.`}
    />
  );
}
