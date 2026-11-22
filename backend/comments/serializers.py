from accounts.models import User
from rest_framework import serializers

from .models import Comment, CommentSetting


class CommentSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommentSetting
        fields = [
            "unmount_all_comment_sections",
            "unmount_all_meetup_comments",
            "unmount_all_album_comments",
        ]
        read_only_fields = fields


class CommentAuthorSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "display_name", "avatar_url"]
        read_only_fields = fields

    def get_avatar_url(self, obj: User) -> str | None:
        if obj.avatar_url:
            return obj.avatar_url
        if obj.avatar:
            try:
                return obj.avatar.url
            except Exception:
                return None
        return None

    def get_display_name(self, obj: User) -> str:
        return obj.display_name or obj.username


class CommentCreateSerializer(serializers.ModelSerializer):
    body = serializers.CharField(
        max_length=500,
        min_length=1,
        allow_blank=False,
        trim_whitespace=True,
    )
    parent = serializers.PrimaryKeyRelatedField(
        queryset=Comment.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Comment
        fields = ["id", "body", "parent"]

    def validate_body(self, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise serializers.ValidationError("Comment cannot be empty.")
        if len(stripped) > 500:
            raise serializers.ValidationError("Comment cannot exceed 500 characters.")
        return stripped

    def validate_parent(self, parent: Comment | None) -> Comment | None:
        if not parent:
            return None
        if parent.deleted_at is not None:
            raise serializers.ValidationError("Cannot reply to a deleted comment.")
        if parent.parent is not None:
            raise serializers.ValidationError("Replies can only be 1 level deep.")
        return parent

    def validate(self, attrs):
        parent = attrs.get("parent")
        target_meetup = self.context.get("meetup")
        target_album = self.context.get("album")
        if parent:
            if target_meetup and parent.meetup_id != target_meetup.id:
                raise serializers.ValidationError(
                    {"parent": "Parent comment does not belong to this meetup."}
                )
            if target_album and parent.album_id != target_album.id:
                raise serializers.ValidationError(
                    {"parent": "Parent comment does not belong to this album."}
                )
        return attrs


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    body = serializers.SerializerMethodField()
    is_deleted = serializers.BooleanField(read_only=True)
    is_author = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            "id",
            "author",
            "body",
            "parent",
            "is_deleted",
            "is_author",
            "can_delete",
            "created_at",
            "replies",
        ]
        read_only_fields = fields

    def get_author(self, obj: Comment):
        if obj.is_deleted:
            return None
        return CommentAuthorSerializer(obj.author).data

    def get_body(self, obj: Comment) -> str:
        if obj.is_deleted:
            return "[deleted]"
        return obj.body

    def get_is_author(self, obj: Comment) -> bool:
        request = self.context.get("request")
        user = request.user if request else None
        if not user or not user.is_authenticated or obj.is_deleted:
            return False
        return obj.author_id == user.id

    def get_can_delete(self, obj: Comment) -> bool:
        request = self.context.get("request")
        user = request.user if request else None
        if not user or not user.is_authenticated or obj.is_deleted:
            return False
        return (
            obj.author_id == user.id
            or user.is_staff
            or getattr(user, "role", None) == "admin"
        )

    def get_replies(self, obj: Comment):
        # Only top-level comments resolve replies to prevent recursion
        if obj.parent_id is not None:
            return []

        replies_dict = self.context.get("replies_by_parent")
        if replies_dict is not None:
            child_replies = replies_dict.get(obj.id, [])
        else:
            child_replies = (
                obj.replies.filter(deleted_at__isnull=True)
                .select_related("author")
                .order_by("created_at", "id")
            )

        return CommentSerializer(child_replies, many=True, context=self.context).data
