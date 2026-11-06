import json
from conventions.models import Convention
from rest_framework import serializers

from .models import Going, Meetup, SavedMeetup


class MeetupListSerializer(serializers.ModelSerializer):
    convention_slug = serializers.CharField(source="convention.slug", read_only=True)
    convention_name = serializers.CharField(source="convention.name", read_only=True)
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
            "convention",
            "convention_slug",
            "convention_name",
            "name",
            "location",
            "starts_at",
            "ends_at",
            "image",
            "image_thumb",
            "is_official",
            "created_by",
            "created_by_name",
            "going_count",
            "save_count",
            "is_saved",
            "is_going",
            "is_owner",
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

    class Meta:
        model = Meetup
        fields = [
            "id",
            "convention",
            "name",
            "location",
            "starts_at",
            "ends_at",
            "description",
            "image",
            "image_thumb",
            "is_official",
            "created_at",
        ]
        read_only_fields = ["id", "image_thumb", "created_at"]

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

        request = self.context.get("request")
        user = request.user if request else None

        # Only staff or superuser can mark a meetup as official
        if not (user and (user.is_staff or user.is_superuser)):
            attrs["is_official"] = False

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
            "name",
            "location",
            "starts_at",
            "ends_at",
            "description",
            "image",
            "clear_image",
            "is_official",
            "updated_at",
        ]
        read_only_fields = ["id", "updated_at"]

    def validate(self, attrs):
        instance = self.instance
        starts_at = attrs.get("starts_at", instance.starts_at if instance else None)
        ends_at = attrs.get("ends_at", instance.ends_at if instance else None)

        if starts_at and ends_at and ends_at <= starts_at:
            raise serializers.ValidationError({"ends_at": "End time must be after start time."})

        request = self.context.get("request")
        user = request.user if request else None

        # Only staff or superuser can toggle is_official
        if "is_official" in attrs and not (user and (user.is_staff or user.is_superuser)):
            attrs.pop("is_official")

        if "description" in attrs:
            attrs["description"] = _format_quill_description(attrs.get("description"))

        return attrs

    def update(self, instance: Meetup, validated_data):
        if validated_data.pop("clear_image", False):
            if instance.image:
                instance.image.delete(save=False)
            instance.image = None
        return super().update(instance, validated_data)
