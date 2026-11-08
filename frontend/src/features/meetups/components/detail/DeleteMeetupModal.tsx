'use client';

import { useDeleteMeetup } from '../../api';
import { ConfirmDeleteModal } from '@/shared/components/ui';

interface DeleteMeetupModalProps {
  meetup: { id: number; name: string };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteMeetupModal({ meetup, isOpen, onClose, onSuccess }: DeleteMeetupModalProps) {
  const deleteMutation = useDeleteMeetup();

  async function handleConfirm() {
    await deleteMutation.mutateAsync(meetup.id);
    onSuccess();
  }

  return (
    <ConfirmDeleteModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      itemName={meetup.name}
      itemType="Meetup"
      isPending={deleteMutation.isPending}
      warningMessage={`Are you sure you want to delete "${meetup.name}"? This action cannot be undone and will permanently remove this meetup from the schedule.`}
    />
  );
}
