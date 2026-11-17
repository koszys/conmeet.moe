'use client';

import { useDeleteAlbum } from '../../api';
import { ConfirmDeleteModal } from '@/shared/components/ui';

interface DeleteAlbumModalProps {
  album: { id: number; title: string };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteAlbumModal({ album, isOpen, onClose, onSuccess }: DeleteAlbumModalProps) {
  const deleteMutation = useDeleteAlbum();

  async function handleConfirm() {
    await deleteMutation.mutateAsync(album.id);
    onSuccess();
  }

  return (
    <ConfirmDeleteModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      itemName={album.title}
      itemType="Photo Album"
      isPending={deleteMutation.isPending}
      warningMessage={`Are you sure you want to delete "${album.title}"? All uploaded photos in this album will be permanently deleted from Cloudflare storage.`}
    />
  );
}
