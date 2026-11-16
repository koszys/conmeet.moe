from conventions.models import Convention
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    AlbumFavorite,
    AlbumLike,
    Going,
    Meetup,
    MeetupAlbum,
    MeetupPhoto,
    PhotoLike,
    SavedMeetup,
)
from .permissions import IsAuthorOrReadOnly
from .serializers import (
    MeetupAlbumCreateUpdateSerializer,
    MeetupAlbumDetailSerializer,
    MeetupAlbumListSerializer,
    MeetupCreateSerializer,
    MeetupDetailSerializer,
    MeetupListSerializer,
    MeetupUpdateSerializer,
)


class ConventionMeetupListCreateView(generics.ListCreateAPIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return MeetupCreateSerializer
        return MeetupListSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        user = self.request.user
        if user and user.is_authenticated:
            # Pre-cache user's saved and going meetup IDs for this convention to prevent N+1 queries
            slug = self.kwargs.get("slug")
            context["saved_meetups_set"] = set(
                SavedMeetup.objects.filter(user=user, meetup__convention__slug=slug).values_list(
                    "meetup_id", flat=True
                )
            )
            context["going_meetups_set"] = set(
                Going.objects.filter(user=user, meetup__convention__slug=slug).values_list(
                    "meetup_id", flat=True
                )
            )
        return context

    def get_queryset(self):
        slug = self.kwargs.get("slug")
        convention = get_object_or_404(Convention, slug=slug)

        qs = (
            Meetup.objects.filter(convention=convention)
            .select_related("convention", "created_by")
            .annotate(
                _going_count=Count("going", distinct=True),
                _save_count=Count("saved_by", distinct=True),
            )
            .order_by("starts_at", "name")
        )

        date_param = self.request.query_params.get("date")
        if date_param:
            qs = qs.filter(starts_at__date=date_param)

        official_param = self.request.query_params.get("official")
        if official_param is not None:
            if official_param.lower() in ("true", "1"):
                qs = qs.filter(is_official=True)
            elif official_param.lower() in ("false", "0"):
                qs = qs.filter(is_official=False)

        q_param = self.request.query_params.get("q")
        if q_param:
            query = q_param.strip()
            qs = qs.filter(
                Q(name__icontains=query)
                | Q(location__icontains=query)
                | Q(description__icontains=query)
            )

        saved_param = self.request.query_params.get("saved")
        user = self.request.user
        if saved_param and saved_param.lower() in ("true", "1") and user.is_authenticated:
            saved_ids = SavedMeetup.objects.filter(
                user=user, meetup__convention=convention
            ).values_list("meetup_id", flat=True)
            qs = qs.filter(id__in=saved_ids)

        return qs

    def perform_create(self, serializer):
        slug = self.kwargs.get("slug")
        convention = get_object_or_404(Convention, slug=slug)
        serializer.save(convention=convention, created_by=self.request.user)


class MeetupDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthorOrReadOnly]
    queryset = Meetup.objects.select_related("convention", "created_by").annotate(
        _going_count=Count("going", distinct=True),
        _save_count=Count("saved_by", distinct=True),
    )

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return MeetupUpdateSerializer
        return MeetupDetailSerializer


class MeetupSaveToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk: int):
        meetup = get_object_or_404(Meetup, pk=pk)
        saved_obj = SavedMeetup.objects.filter(user=request.user, meetup=meetup).first()

        if saved_obj:
            saved_obj.delete()
            is_saved = False
        else:
            SavedMeetup.objects.create(user=request.user, meetup=meetup)
            is_saved = True

        save_count = meetup.saved_by.count()
        return Response(
            {"is_saved": is_saved, "save_count": save_count},
            status=status.HTTP_200_OK,
        )


class MeetupGoingToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk: int):
        meetup = get_object_or_404(Meetup, pk=pk)
        going_obj = Going.objects.filter(user=request.user, meetup=meetup).first()

        if going_obj:
            going_obj.delete()
            is_going = False
        else:
            Going.objects.create(user=request.user, meetup=meetup)
            is_going = True

        going_count = meetup.going.count()
        return Response(
            {"is_going": is_going, "going_count": going_count},
            status=status.HTTP_200_OK,
        )


class MeetupAlbumListCreateView(generics.ListCreateAPIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return MeetupAlbumCreateUpdateSerializer
        return MeetupAlbumListSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        user = self.request.user
        if user and user.is_authenticated:
            meetup_id = self.kwargs.get("meetup_id")
            context["liked_albums_set"] = set(
                AlbumLike.objects.filter(user=user, album__meetup_id=meetup_id).values_list(
                    "album_id", flat=True
                )
            )
            context["favorite_albums_set"] = set(
                AlbumFavorite.objects.filter(user=user, album__meetup_id=meetup_id).values_list(
                    "album_id", flat=True
                )
            )
        return context

    def get_queryset(self):
        meetup_id = self.kwargs.get("meetup_id")
        meetup = get_object_or_404(Meetup, id=meetup_id)
        qs = (
            MeetupAlbum.objects.filter(meetup=meetup)
            .select_related("meetup", "created_by", "cover_photo")
            .prefetch_related("photos")
        )

        sort_param = self.request.query_params.get("sort", "newest")
        if sort_param == "popular":
            qs = qs.order_by("-likes_count", "-created_at")
        elif sort_param == "photos":
            qs = qs.order_by("-photos_count", "-created_at")
        else:
            qs = qs.order_by("-created_at")

        return qs

    def perform_create(self, serializer):
        meetup_id = self.kwargs.get("meetup_id")
        meetup = get_object_or_404(Meetup, id=meetup_id)
        photos = self.request.FILES.getlist("photos")

        if len(photos) > 30:
            raise ValidationError({"photos": "You can upload a maximum of 30 photos per album."})

        album = serializer.save(meetup=meetup, created_by=self.request.user)

        first_photo = None
        for idx, file in enumerate(photos):
            photo = MeetupPhoto.objects.create(album=album, image=file, order=idx)
            if first_photo is None:
                first_photo = photo

        album.photos_count = len(photos)
        if first_photo:
            album.cover_photo = first_photo
        album.save(update_fields=["photos_count", "cover_photo"])


class AlbumDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthorOrReadOnly]
    queryset = MeetupAlbum.objects.select_related("meetup", "created_by", "cover_photo")

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return MeetupAlbumCreateUpdateSerializer
        return MeetupAlbumDetailSerializer

    def perform_update(self, serializer):
        album = serializer.save()

        # Handle deletion of photos
        delete_ids_raw = self.request.data.get("delete_photo_ids")
        if delete_ids_raw:
            if isinstance(delete_ids_raw, str):
                delete_ids = [
                    int(x.strip()) for x in delete_ids_raw.split(",") if x.strip().isdigit()
                ]
            elif isinstance(delete_ids_raw, list):
                delete_ids = [int(x) for x in delete_ids_raw if str(x).isdigit()]
            else:
                delete_ids = []

            if delete_ids:
                MeetupPhoto.objects.filter(album=album, id__in=delete_ids).delete()

        # Handle appending new photos
        new_photos = self.request.FILES.getlist("photos")
        current_count = album.photos.count()
        if new_photos:
            if current_count + len(new_photos) > 30:
                raise ValidationError(
                    {
                        "photos": (
                            f"Max 30 photos allowed. Current: {current_count}, "
                            f"adding: {len(new_photos)}."
                        )
                    }
                )
            for idx, file in enumerate(new_photos):
                MeetupPhoto.objects.create(album=album, image=file, order=current_count + idx)

        album.photos_count = album.photos.count()
        if (
            album.cover_photo_id
            and not MeetupPhoto.objects.filter(id=album.cover_photo_id).exists()
        ) or (not album.cover_photo and album.photos_count > 0):
            album.cover_photo = album.photos.first()

        album.save(update_fields=["photos_count", "cover_photo"])


class AlbumLikeToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk: int):
        album = get_object_or_404(MeetupAlbum, pk=pk)
        like_obj = AlbumLike.objects.filter(user=request.user, album=album).first()

        if like_obj:
            like_obj.delete()
            is_liked = False
        else:
            AlbumLike.objects.create(user=request.user, album=album)
            is_liked = True

        likes_count = album.likes.count()
        album.likes_count = likes_count
        album.save(update_fields=["likes_count"])

        return Response(
            {"is_liked": is_liked, "likes_count": likes_count},
            status=status.HTTP_200_OK,
        )


class AlbumFavoriteToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk: int):
        album = get_object_or_404(MeetupAlbum, pk=pk)
        fav_obj = AlbumFavorite.objects.filter(user=request.user, album=album).first()

        if fav_obj:
            fav_obj.delete()
            is_favorited = False
        else:
            AlbumFavorite.objects.create(user=request.user, album=album)
            is_favorited = True

        favorites_count = album.favorites.count()
        album.favorites_count = favorites_count
        album.save(update_fields=["favorites_count"])

        return Response(
            {"is_favorited": is_favorited, "favorites_count": favorites_count},
            status=status.HTTP_200_OK,
        )


class PhotoLikeToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk: int):
        photo = get_object_or_404(MeetupPhoto, pk=pk)
        like_obj = PhotoLike.objects.filter(user=request.user, photo=photo).first()

        if like_obj:
            like_obj.delete()
            is_liked = False
        else:
            PhotoLike.objects.create(user=request.user, photo=photo)
            is_liked = True

        likes_count = photo.likes.count()
        photo.likes_count = likes_count
        photo.save(update_fields=["likes_count"])

        return Response(
            {"is_liked": is_liked, "likes_count": likes_count},
            status=status.HTTP_200_OK,
        )

