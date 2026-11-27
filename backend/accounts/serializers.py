from allauth.socialaccount.models import SocialAccount
from rest_framework import serializers

from .models import User

RESERVED_USERNAMES = {
    "admin",
    "administrator",
    "system",
    "anonymous",
    "settings",
    "api",
}


class UserSerializer(serializers.ModelSerializer):
    providers = serializers.SerializerMethodField()
    provider_emails = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
    has_custom_avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "display_name",
            "avatar_url",
            "has_custom_avatar",
            "role",
            "date_joined",
            "last_login",
            "providers",
            "provider_emails",
        ]
        read_only_fields = fields

    def get_providers(self, obj: User) -> list[str]:
        return sorted(SocialAccount.objects.filter(user=obj).values_list("provider", flat=True))

    def get_provider_emails(self, obj: User) -> dict[str, str]:
        emails: dict[str, str] = {}
        for account in SocialAccount.objects.filter(user=obj):
            email = (account.extra_data or {}).get("email")
            if isinstance(email, str) and email:
                emails[account.provider] = email
        return emails

    def get_avatar_url(self, obj: User) -> str:
        if obj.avatar:
            try:
                return obj.avatar.url
            except Exception:
                pass
        return obj.avatar_url or ""

    def get_has_custom_avatar(self, obj: User) -> bool:
        return bool(obj.avatar)


class UserUpdateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        max_length=20,
        min_length=1,
        validators=[User.username_validator],
        required=False,
    )
    display_name = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True,
    )
    avatar = serializers.ImageField(
        required=False,
        allow_null=True,
    )
    remove_avatar = serializers.BooleanField(
        required=False,
        default=False,
    )

    class Meta:
        model = User
        fields = [
            "username",
            "display_name",
            "avatar",
            "remove_avatar",
        ]

    def validate_username(self, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Username cannot be blank.")
        if len(cleaned) > 20:
            raise serializers.ValidationError("Username cannot exceed 20 characters.")
        if cleaned.lower() in RESERVED_USERNAMES:
            raise serializers.ValidationError(f"'{cleaned}' is a reserved username.")

        user = self.instance
        existing = User.objects.filter(username__iexact=cleaned)
        if user:
            existing = existing.exclude(pk=user.pk)
        if existing.exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return cleaned

    def validate_avatar(self, value):
        if value:
            max_size = 5 * 1024 * 1024
            if value.size > max_size:
                raise serializers.ValidationError("Image file size must not exceed 5MB.")
            content_type = getattr(value, "content_type", "")
            if content_type == "image/gif":
                raise serializers.ValidationError("GIF format is not supported for avatars.")
            allowed_types = {"image/jpeg", "image/png", "image/webp"}
            if content_type and content_type not in allowed_types:
                raise serializers.ValidationError("Unsupported image format. Allowed: PNG, JPG, WEBP.")
        return value

    def update(self, instance: User, validated_data: dict) -> User:
        remove_avatar = validated_data.pop("remove_avatar", False)
        if remove_avatar:
            instance.avatar = None
        elif "avatar" in validated_data:
            instance.avatar = validated_data.pop("avatar")

        if "username" in validated_data:
            instance.username = validated_data["username"]

        if "display_name" in validated_data:
            instance.display_name = validated_data["display_name"]

        instance.save()
        return instance
