from rest_framework import serializers

from .models import Convention


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
            "banner",
            "banner_thumb",
            "is_featured",
        ]

    def get_banner_thumb(self, obj: Convention) -> str | None:
        if obj.banner:
            return obj.banner_thumb.url
        return None


class ConventionDetailSerializer(ConventionListSerializer):
    class Meta(ConventionListSerializer.Meta):
        fields = ConventionListSerializer.Meta.fields + ["description", "map_url"]
