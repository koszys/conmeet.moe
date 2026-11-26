from django.db import transaction
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from freebies.models import Freebie, UserFreebie
from meetups.models import AlbumFavorite, Meetup, MeetupAlbum, SavedMeetup


class SyncGuestSavesView(APIView):
    """
    Synchronizes locally saved items (meetups, freebies, albums) from an
    unauthenticated guest session to the authenticated user's account.

    Conflict Resolution:
    - Additive union: preserves all existing account saves.
    - Idempotent: duplicates are skipped via ignore_conflicts=True.
    - Never downgrades existing claimed status on Freebies.
    """

    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        user = request.user
        meetup_ids = request.data.get("meetup_ids", [])
        freebie_ids = request.data.get("freebie_ids", [])
        claimed_freebie_ids = request.data.get("claimed_freebie_ids", [])
        album_ids = request.data.get("album_ids", [])

        # Validate that input elements are integers/valid IDs
        clean_meetup_ids = [int(i) for i in meetup_ids if str(i).isdigit()]
        clean_freebie_ids = [int(i) for i in freebie_ids if str(i).isdigit()]
        clean_claimed_freebie_ids = [int(i) for i in claimed_freebie_ids if str(i).isdigit()]
        clean_album_ids = [int(i) for i in album_ids if str(i).isdigit()]

        # 1. Meetups: Insert only non-existing saves (Account Priority)
        valid_meetup_ids = set(
            Meetup.objects.filter(id__in=clean_meetup_ids).values_list("id", flat=True)
        )
        existing_saved_meetup_ids = set(
            SavedMeetup.objects.filter(user=user, meetup_id__in=valid_meetup_ids).values_list(
                "meetup_id", flat=True
            )
        )
        new_meetup_ids = valid_meetup_ids - existing_saved_meetup_ids
        if new_meetup_ids:
            SavedMeetup.objects.bulk_create(
                [SavedMeetup(user=user, meetup_id=m_id) for m_id in new_meetup_ids],
                ignore_conflicts=True,
            )

        # 2. Freebies: Handle both saved and claimed freebies
        valid_freebie_ids = set(
            Freebie.objects.filter(id__in=clean_freebie_ids).values_list("id", flat=True)
        )
        valid_claimed_ids = set(
            Freebie.objects.filter(id__in=clean_claimed_freebie_ids).values_list("id", flat=True)
        )

        all_target_freebie_ids = valid_freebie_ids | valid_claimed_ids
        existing_user_freebies = {
            uf.freebie_id: uf
            for uf in UserFreebie.objects.filter(user=user, freebie_id__in=all_target_freebie_ids)
        }

        # Any claimed in guest session: create or update to claimed=True
        now = timezone.now()
        to_create = []
        to_update = []
        for f_id in valid_claimed_ids:
            if f_id in existing_user_freebies:
                uf = existing_user_freebies[f_id]
                if not uf.claimed:
                    uf.claimed = True
                    uf.claimed_at = now
                    to_update.append(uf)
            else:
                to_create.append(UserFreebie(user=user, freebie_id=f_id, claimed=True, claimed_at=now))

        # Any saved but unclaimed in guest session: create with claimed=False if not existing
        for f_id in (valid_freebie_ids - valid_claimed_ids):
            if f_id not in existing_user_freebies:
                to_create.append(UserFreebie(user=user, freebie_id=f_id, claimed=False))

        if to_create:
            UserFreebie.objects.bulk_create(to_create, ignore_conflicts=True)
        if to_update:
            UserFreebie.objects.bulk_update(to_update, ["claimed", "claimed_at"])

        # 3. Albums: Insert only non-existing favorites
        valid_album_ids = set(
            MeetupAlbum.objects.filter(id__in=clean_album_ids).values_list("id", flat=True)
        )
        existing_album_ids = set(
            AlbumFavorite.objects.filter(user=user, album_id__in=valid_album_ids).values_list(
                "album_id", flat=True
            )
        )
        new_album_ids = valid_album_ids - existing_album_ids
        if new_album_ids:
            AlbumFavorite.objects.bulk_create(
                [AlbumFavorite(user=user, album_id=a_id) for a_id in new_album_ids],
                ignore_conflicts=True,
            )

        return Response(
            {
                "synced": True,
                "added_meetups": len(new_meetup_ids),
                "added_freebies": len(to_create),
                "claimed_freebies_updated": len(to_update),
                "added_albums": len(new_album_ids),
            },
            status=status.HTTP_200_OK,
        )
