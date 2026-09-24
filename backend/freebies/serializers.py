from conventions.models import Convention
from rest_framework import serializers

from .models import Freebie, UserFreebie, Vendor


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ["id", "name", "description", "website_url", "image"]


class FreebieSerializer(serializers.ModelSerializer):
    vendor = VendorSerializer(read_only=True)
    convention_slug = serializers.CharField(source="convention.slug", read_only=True, default=None)
    convention_name = serializers.CharField(source="convention.name", read_only=True, default=None)
    image_thumb = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    is_claimed = serializers.SerializerMethodField()
    claimed_at = serializers.SerializerMethodField()
    save_count = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Freebie
        fields = [
            "id",
            "name",
            "description",
            "requirements",
            "location",
            "image",
            "image_thumb",
            "vendor",
            "convention",
            "convention_slug",
            "convention_name",
            "created_by",
            "created_by_name",
            "is_saved",
            "is_claimed",
            "claimed_at",
            "save_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_image_thumb(self, obj: Freebie) -> str | None:
        if obj.image:
            try:
                return obj.image_thumb.url
            except Exception:
                return obj.image.url
        return None

    def get_created_by_name(self, obj: Freebie) -> str | None:
        if not obj.created_by:
            return None
        return obj.created_by.display_name or obj.created_by.username

    def _get_user_freebie(self, obj: Freebie) -> UserFreebie | None:
        request = self.context.get("request")
        user = request.user if request else None
        if not user or not user.is_authenticated:
            return None
        if not hasattr(obj, "_user_freebie_cache"):
            user_freebies_map = self.context.get("user_freebies_map")
            if user_freebies_map is not None:
                obj._user_freebie_cache = user_freebies_map.get(obj.id)
            else:
                obj._user_freebie_cache = UserFreebie.objects.filter(user=user, freebie=obj).first()
        return obj._user_freebie_cache

    def get_is_saved(self, obj: Freebie) -> bool:
        return self._get_user_freebie(obj) is not None

    def get_is_claimed(self, obj: Freebie) -> bool:
        uf = self._get_user_freebie(obj)
        return uf.claimed if uf else False

    def get_claimed_at(self, obj: Freebie) -> str | None:
        uf = self._get_user_freebie(obj)
        return uf.claimed_at.isoformat() if uf and uf.claimed_at else None

    def get_save_count(self, obj: Freebie) -> int:
        if hasattr(obj, "_save_count"):
            return obj._save_count
        return obj.saved_by.count()


class FreebieCreateSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(write_only=True, required=True, max_length=50)
    name = serializers.CharField(max_length=60, required=True)
    location = serializers.CharField(max_length=50, required=False, allow_blank=True)
    requirements = serializers.CharField(max_length=200, required=False, allow_blank=True)
    description = serializers.CharField(max_length=300, required=False, allow_blank=True)
    convention_slug = serializers.CharField(
        write_only=True, required=False, allow_blank=True, allow_null=True, default=None
    )

    class Meta:
        model = Freebie
        fields = [
            "id",
            "name",
            "description",
            "requirements",
            "location",
            "image",
            "vendor_name",
            "convention",
            "convention_slug",
        ]
        extra_kwargs = {
            "convention": {"required": False, "allow_null": True},
        }

    def validate_convention_slug(self, value: str | None) -> Convention | None:
        if not value:
            return None
        try:
            return Convention.objects.get(slug=value)
        except Convention.DoesNotExist:
            raise serializers.ValidationError(f"Convention with slug '{value}' does not exist.")

    def create(self, validated_data: dict) -> Freebie:
        vendor_name = validated_data.pop("vendor_name").strip()
        convention_from_slug = validated_data.pop("convention_slug", None)
        if convention_from_slug and not validated_data.get("convention"):
            validated_data["convention"] = convention_from_slug

        vendor = Vendor.objects.filter(name__iexact=vendor_name).first()
        if not vendor:
            vendor = Vendor.objects.create(name=vendor_name)
        validated_data["vendor"] = vendor
        validated_data["created_by"] = self.context["request"].user

        return super().create(validated_data)
