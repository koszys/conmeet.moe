import json

from conventions.models import Convention
from rest_framework import serializers

from .models import (
    AlbumFavorite,
    AlbumLike,
    Going,
    Meetup,
    MeetupAlbum,
    MeetupPhoto,
    MeetupSetting,
    PhotoLike,
    SavedMeetup,
)


class MeetupListSerializer(serializers.ModelSerializer):
    convention_slug = serializers.CharField(source="convention.slug", read_only=True)
    convention_name = serializers.CharField(source="convention.name", read_only=True)
    convention_ends_at = serializers.DateField(source="convention.ends_at", read_only=True, default=None)
    image_thumb = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    is_going = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    going_count = serializers.SerializerMethodField()
    save_count = serializers.SerializerMethodField()

    class Meta:
        model = Meetup
        fields = [
            "id",
            "slug",
            "convention",
            "convention_slug",
            "convention_name",
            "convention_ends_at",
            "name",
            "location",
            "starts_at",
            "ends_at",
            "image",
            "image_thumb",
            "image_layout",
            "is_official",
            "created_by",
            "created_by_name",
            "going_count",
            "save_count",
            "is_saved",
            "is_going",
            "is_owner",
            "unmount_comments",
            "unmount_albums",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_image_thumb(self, obj: Meetup) -> str | None:
        if obj.image:
            try:
                return obj.image_thumb.url
            except Exception:
                return obj.image.url
        return None

    def get_created_by_name(self, obj: Meetup) -> str | None:
        if not obj.created_by:
            return None
        return getattr(obj.created_by, "display_name", None) or obj.created_by.username

    def get_is_saved(self, obj: Meetup) -> bool:
        request = self.context.get("request")
        user = request.user if request else None
        if not user or not user.is_authenticated:
            return False
        if not hasattr(obj, "_saved_cache"):
            saved_map = self.context.get("saved_meetups_set")
            if saved_map is not None:
                obj._saved_cache = obj.id in saved_map
            else:
                obj._saved_cache = SavedMeetup.objects.filter(user=user, meetup=obj).exists()
        return obj._saved_cache

    def get_is_going(self, obj: Meetup) -> bool:
        request = self.context.get("request")
        user = request.user if request else None
        if not user or not user.is_authenticated:
            return False
        if not hasattr(obj, "_going_cache"):
            going_map = self.context.get("going_meetups_set")
            if going_map is not None:
                obj._going_cache = obj.id in going_map
            else:
                obj._going_cache = Going.objects.filter(user=user, meetup=obj).exists()
        return obj._going_cache

    def get_is_owner(self, obj: Meetup) -> bool:
        request = self.context.get("request")
        user = request.user if request else None
        if not user or not user.is_authenticated:
            return False
        return bool(obj.created_by_id == user.id)

    def get_going_count(self, obj: Meetup) -> int:
        if hasattr(obj, "_going_count"):
            return obj._going_count
        return obj.going.count()

    def get_save_count(self, obj: Meetup) -> int:
        if hasattr(obj, "_save_count"):
            return obj._save_count
        return obj.saved_by.count()


class MeetupDetailSerializer(MeetupListSerializer):
    description = serializers.SerializerMethodField()

    class Meta(MeetupListSerializer.Meta):
        fields = MeetupListSerializer.Meta.fields + ["description"]

    def get_description(self, obj: Meetup) -> str:
        value = obj.description
        if not value:
            return ""
        try:
            return value.html
        except Exception:
            return str(value)


def _format_quill_description(description_raw: str | None) -> str:
    """Format plain text or html as Quill JSON string."""
    if not description_raw:
        return json.dumps({"delta": "", "html": ""})
    if isinstance(description_raw, str):
        if description_raw.startswith('{"'):
            return description_raw
        html_content = (
            f"<p>{description_raw}</p>"
            if not description_raw.strip().startswith("<")
            else description_raw
        )
        return json.dumps({"delta": "", "html": html_content})
    return str(description_raw)


class MeetupCreateSerializer(serializers.ModelSerializer):
    convention = serializers.PrimaryKeyRelatedField(
        queryset=Convention.objects.all(), required=False
    )
    name = serializers.CharField(max_length=120, required=True, allow_blank=False)
    location = serializers.CharField(max_length=255, required=False, allow_blank=True, default="")
    starts_at = serializers.DateTimeField(required=True)
    ends_at = serializers.DateTimeField(required=True)
    description = serializers.CharField(required=False, allow_blank=True, default="")
    image = serializers.ImageField(required=False, allow_null=True)
    image_thumb = serializers.SerializerMethodField()
    is_official = serializers.BooleanField(required=False, default=False)
    unmount_comments = serializers.BooleanField(required=False, default=False)

    class Meta:
        model = Meetup
        fields = [
            "id",
            "slug",
            "convention",
            "name",
            "location",
            "starts_at",
            "ends_at",
            "description",
            "image",
            "image_thumb",
            "image_layout",
            "is_official",
            "unmount_comments",
            "created_at",
        ]
        read_only_fields = ["id", "slug", "image_thumb", "created_at"]

    def get_image_thumb(self, obj: Meetup) -> str | None:
        if obj.image:
            try:
                return obj.image_thumb.url
            except Exception:
                return obj.image.url
        return None

    def validate(self, attrs):
        starts_at = attrs.get("starts_at")
        ends_at = attrs.get("ends_at")
        if starts_at and ends_at and ends_at <= starts_at:
            raise serializers.ValidationError({"ends_at": "End time must be after start time."})

        if "description" in attrs:
            attrs["description"] = _format_quill_description(attrs.get("description"))

        return attrs


class MeetupUpdateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(max_length=120, required=False)
    location = serializers.CharField(max_length=255, required=False, allow_blank=True)
    starts_at = serializers.DateTimeField(required=False)
    ends_at = serializers.DateTimeField(required=False)
    description = serializers.CharField(required=False, allow_blank=True)
    image = serializers.ImageField(required=False, allow_null=True)
    clear_image = serializers.BooleanField(write_only=True, required=False, default=False)
    is_official = serializers.BooleanField(required=False)

    class Meta:
        model = Meetup
        fields = [
            "id",
            "slug",
            "name",
            "location",
            "starts_at",
            "ends_at",
            "description",
            "image",
            "image_layout",
            "clear_image",
            "is_official",
            "unmount_comments",
            "updated_at",
        ]
        read_only_fields = ["id", "slug", "updated_at"]

    def validate(self, attrs):
        instance = self.instance
        starts_at = attrs.get("starts_at", instance.starts_at if instance else None)
        ends_at = attrs.get("ends_at", instance.ends_at if instance else None)

        if starts_at and ends_at and ends_at <= starts_at:
            raise serializers.ValidationError({"ends_at": "End time must be after start time."})

        if "description" in attrs:
            attrs["description"] = _format_quill_description(attrs.get("description"))

        return attrs

    def update(self, instance: Meetup, validated_data):
        if validated_data.pop("clear_image", False):
            instance.image = None
        return super().update(instance, validated_data)


class MeetupPhotoSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    image_thumb = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = MeetupPhoto
        fields = [
            "id",
            "album",
            "image",
            "image_thumb",
            "caption",
            "order",
            "likes_count",
            "is_liked",
            "created_at",
        ]
        read_only_fields = fields

    def get_image(self, obj: MeetupPhoto) -> str:
        return obj.image.url if obj.image else ""

    def get_image_thumb(self, obj: MeetupPhoto) -> str:
        if obj.image:
            try:
                return obj.image_thumb.url
            except Exception:
                return obj.image.url
        return ""

    def get_is_liked(self, obj: MeetupPhoto) -> bool:
        request = self.context.get("request")
        user = request.user if request else None
        if not user or not user.is_authenticated:
            return False
        liked_photos_set = self.context.get("liked_photos_set")
        if liked_photos_set is not None:
            return obj.id in liked_photos_set
        return PhotoLike.objects.filter(user=user, photo=obj).exists()


class MeetupAlbumListSerializer(serializers.ModelSerializer):
    meetup_slug = serializers.CharField(source="meetup.slug", read_only=True)
    cover_photo_url = serializers.SerializerMethodField()
    cover_thumb_url = serializers.SerializerMethodField()
    preview_photos = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = MeetupAlbum
        fields = [
            "id",
            "meetup",
            "meetup_slug",
            "title",
            "description",
            "social_links",
            "cover_photo",
            "cover_photo_url",
            "cover_thumb_url",
            "preview_photos",
            "photos_count",
            "likes_count",
            "favorites_count",
            "is_liked",
            "is_favorited",
            "is_owner",
            "unmount_comments",
            "unmount_album",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_cover_photo_url(self, obj: MeetupAlbum) -> str | None:
        if obj.cover_photo and obj.cover_photo.image:
            return obj.cover_photo.image.url
        first_photo = getattr(obj, "_first_photo", None)
        if first_photo and first_photo.image:
            return first_photo.image.url
        first = obj.photos.first()
        return first.image.url if first and first.image else None

    def get_cover_thumb_url(self, obj: MeetupAlbum) -> str | None:
        target = obj.cover_photo or getattr(obj, "_first_photo", None)
        if not target:
            target = obj.photos.first()
        if target and target.image:
            try:
                return target.image_thumb.url
            except Exception:
                return target.image.url
        return None

    def get_preview_photos(self, obj: MeetupAlbum) -> list[str]:
        previews = []
        photos = getattr(obj, "_prefetched_photos", None)
        if photos is None:
            photos = obj.photos.all()[:4]
        for p in photos[:4]:
            if p.image:
                try:
                    previews.append(p.image_thumb.url)
                except Exception:
                    previews.append(p.image.url)
        return previews

    def get_created_by_name(self, obj: MeetupAlbum) -> str | None:
        if not obj.created_by:
            return None
        return getattr(obj.created_by, "display_name", None) or obj.created_by.username

    def get_is_liked(self, obj: MeetupAlbum) -> bool:
        request = self.context.get("request")
        user = request.user if request else None
        if not user or not user.is_authenticated:
            return False
        liked_set = self.context.get("liked_albums_set")
        if liked_set is not None:
            return obj.id in liked_set
        return AlbumLike.objects.filter(user=user, album=obj).exists()

    def get_is_favorited(self, obj: MeetupAlbum) -> bool:
        request = self.context.get("request")
        user = request.user if request else None
        if not user or not user.is_authenticated:
            return False
        fav_set = self.context.get("favorite_albums_set")
        if fav_set is not None:
            return obj.id in fav_set
        return AlbumFavorite.objects.filter(user=user, album=obj).exists()

    def get_is_owner(self, obj: MeetupAlbum) -> bool:
        request = self.context.get("request")
        user = request.user if request else None
        if not user or not user.is_authenticated:
            return False
        return bool(obj.created_by_id == user.id)


class MeetupAlbumDetailSerializer(MeetupAlbumListSerializer):
    photos = serializers.SerializerMethodField()

    class Meta(MeetupAlbumListSerializer.Meta):
        fields = MeetupAlbumListSerializer.Meta.fields + ["photos"]

    def get_photos(self, obj: MeetupAlbum):
        photos_qs = obj.photos.all().order_by("order", "created_at")
        context = self.context.copy()
        user = context.get("request").user if context.get("request") else None
        if user and user.is_authenticated and "liked_photos_set" not in context:
            context["liked_photos_set"] = set(
                PhotoLike.objects.filter(user=user, photo__album=obj).values_list(
                    "photo_id", flat=True
                )
            )
        return MeetupPhotoSerializer(photos_qs, many=True, context=context).data


class MeetupAlbumCreateUpdateSerializer(serializers.ModelSerializer):
    title = serializers.CharField(max_length=120, required=True, allow_blank=False)
    description = serializers.CharField(required=False, allow_blank=True, default="")
    social_links = serializers.JSONField(required=False, default=dict)

    class Meta:
        model = MeetupAlbum
        fields = [
            "id",
            "title",
            "description",
            "social_links",
            "unmount_comments",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_social_links(self, value):
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except Exception:
                raise serializers.ValidationError("Invalid JSON for social_links.") from None
        if not isinstance(value, dict):
            raise serializers.ValidationError("social_links must be an object.")
        allowed_keys = {"instagram", "twitter", "tiktok", "bluesky", "website"}
        cleaned = {}
        for k, v in value.items():
            if k in allowed_keys and isinstance(v, str):
                cleaned[k] = v.strip()
        return cleaned


class MeetupSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeetupSetting
        fields = ["unmount_all_albums", "updated_at"]


