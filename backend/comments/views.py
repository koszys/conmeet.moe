from django.shortcuts import get_object_or_404
from django.utils import timezone
from meetups.models import MeetupAlbum
from meetups.views import get_meetup_by_pk_or_slug
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Comment, CommentSetting
from .serializers import (
    CommentCreateSerializer,
    CommentSerializer,
    CommentSettingSerializer,
)


class CommentSettingsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        settings = CommentSetting.get_settings()
        serializer = CommentSettingSerializer(settings)
        return Response(serializer.data)


class MeetupCommentListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get(self, request, meetup_id):
        meetup = get_meetup_by_pk_or_slug(meetup_id)
        settings = CommentSetting.get_settings()
        if (
            settings.unmount_all_comment_sections
            or settings.unmount_all_meetup_comments
            or meetup.unmount_comments
        ):
            return Response([])

        comments_qs = (
            Comment.objects.filter(meetup=meetup)
            .select_related("author")
            .order_by("created_at", "id")
        )

        replies_by_parent: dict[int, list[Comment]] = {}
        top_level: list[Comment] = []
        for c in comments_qs:
            if c.parent_id is not None:
                if not c.is_deleted:
                    replies_by_parent.setdefault(c.parent_id, []).append(c)
            else:
                top_level.append(c)

        visible_top_level = [
            c
            for c in top_level
            if not c.is_deleted or len(replies_by_parent.get(c.id, [])) > 0
        ]

        context = {
            "request": request,
            "meetup": meetup,
            "replies_by_parent": replies_by_parent,
        }
        serializer = CommentSerializer(visible_top_level, many=True, context=context)
        return Response(serializer.data)

    def post(self, request, meetup_id):
        meetup = get_meetup_by_pk_or_slug(meetup_id)
        settings = CommentSetting.get_settings()
        if settings.unmount_all_comment_sections:
            return Response(
                {"detail": "Comments are disabled sitewide."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if settings.unmount_all_meetup_comments or meetup.unmount_comments:
            return Response(
                {"detail": "Comments are disabled for this meetup."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = CommentCreateSerializer(
            data=request.data,
            context={"request": request, "meetup": meetup},
        )
        serializer.is_valid(raise_exception=True)
        comment = serializer.save(author=request.user, meetup=meetup)
        output_serializer = CommentSerializer(
            comment,
            context={"request": request, "meetup": meetup, "replies_by_parent": {}},
        )
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class AlbumCommentListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get(self, request, album_id):
        album = get_object_or_404(MeetupAlbum, pk=album_id)
        settings = CommentSetting.get_settings()
        if (
            settings.unmount_all_comment_sections
            or settings.unmount_all_album_comments
            or album.unmount_comments
        ):
            return Response([])

        comments_qs = (
            Comment.objects.filter(album=album)
            .select_related("author")
            .order_by("created_at", "id")
        )

        replies_by_parent: dict[int, list[Comment]] = {}
        top_level: list[Comment] = []
        for c in comments_qs:
            if c.parent_id is not None:
                if not c.is_deleted:
                    replies_by_parent.setdefault(c.parent_id, []).append(c)
            else:
                top_level.append(c)

        visible_top_level = [
            c
            for c in top_level
            if not c.is_deleted or len(replies_by_parent.get(c.id, [])) > 0
        ]

        context = {
            "request": request,
            "album": album,
            "replies_by_parent": replies_by_parent,
        }
        serializer = CommentSerializer(visible_top_level, many=True, context=context)
        return Response(serializer.data)

    def post(self, request, album_id):
        album = get_object_or_404(MeetupAlbum, pk=album_id)
        settings = CommentSetting.get_settings()
        if settings.unmount_all_comment_sections:
            return Response(
                {"detail": "Comments are disabled sitewide."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if settings.unmount_all_album_comments or album.unmount_comments:
            return Response(
                {"detail": "Comments are disabled for this album."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = CommentCreateSerializer(
            data=request.data,
            context={"request": request, "album": album},
        )
        serializer.is_valid(raise_exception=True)
        comment = serializer.save(author=request.user, album=album)
        output_serializer = CommentSerializer(
            comment,
            context={"request": request, "album": album, "replies_by_parent": {}},
        )
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class CommentDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["delete", "head", "options"]

    def delete(self, request, pk: int):
        comment = get_object_or_404(Comment, pk=pk)
        is_owner = comment.author_id == request.user.id
        is_staff_or_admin = (
            request.user.is_staff or getattr(request.user, "role", None) == "admin"
        )
        if not is_owner and not is_staff_or_admin:
            return Response(
                {"detail": "You do not have permission to delete this comment."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not comment.is_deleted:
            comment.deleted_at = timezone.now()
            comment.save(update_fields=["deleted_at", "updated_at"])

        return Response(status=status.HTTP_204_NO_CONTENT)
