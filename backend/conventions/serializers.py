from rest_framework import serializers

from .models import Convention, ConventionRequest


class ConventionListSerializer(serializers.ModelSerializer):
    banner_thumb = serializers.SerializerMethodField()

    class Meta:
        model = Convention
        fields = [
            "id",
            "name",
            "slug",
            "venue_name",
            "city",
            "country",
            "starts_at",
            "ends_at",
            "website_url",
            "map_url",
            "banner",
            "banner_thumb",
            "is_featured",
            "featured_priority",
        ]

    def get_banner_thumb(self, obj: Convention) -> str | None:
        if obj.banner:
            return obj.banner_thumb.url
        return None


class ConventionDetailSerializer(ConventionListSerializer):
    description = serializers.SerializerMethodField()

    class Meta(ConventionListSerializer.Meta):
        fields = ConventionListSerializer.Meta.fields + ["description"]

    def get_description(self, obj: Convention) -> str:
        value = obj.description
        if not value:
            return ""
        return value.html


class ConventionRequestCreateSerializer(serializers.ModelSerializer):
    website_url = serializers.URLField(required=True, allow_blank=False)
    map_url = serializers.URLField(required=True, allow_blank=False)
    venue_name = serializers.CharField(required=True, allow_blank=False, max_length=255)
    city = serializers.CharField(required=True, allow_blank=False, max_length=120)
    country = serializers.CharField(required=True, allow_blank=False, max_length=120)

    class Meta:
        model = ConventionRequest
        fields = [
            "id",
            "name",
            "venue_name",
            "city",
            "country",
            "starts_at",
            "ends_at",
            "website_url",
            "map_url",
            "banner",
            "notes",
            "contact_email",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]

    def validate(self, attrs):
        starts_at = attrs.get("starts_at")
        ends_at = attrs.get("ends_at")
        if starts_at and ends_at and ends_at < starts_at:
            raise serializers.ValidationError({"ends_at": "End date cannot be before start date."})
        return attrs
