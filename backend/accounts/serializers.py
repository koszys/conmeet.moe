from allauth.socialaccount.models import SocialAccount
from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    providers = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "display_name",
            "avatar_url",
            "role",
            "date_joined",
            "last_login",
            "providers",
        ]
        read_only_fields = fields

    def get_providers(self, obj: User) -> list[str]:
        return sorted(SocialAccount.objects.filter(user=obj).values_list("provider", flat=True))
