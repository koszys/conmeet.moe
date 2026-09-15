from allauth.socialaccount.models import SocialAccount
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.utils.html import format_html

from .models import User


class SocialAccountInline(admin.TabularInline):
    model = SocialAccount
    extra = 0
    readonly_fields = ("provider", "uid", "last_login", "date_joined")
    can_delete = False


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    inlines = (SocialAccountInline,)
    list_display = (
        "username",
        "email",
        "display_name",
        "role",
        "is_active",
        "is_staff",
        "date_joined",
    )
    list_filter = ("role", "is_staff", "is_active", "is_guest")
    ordering = ("-date_joined",)
    search_fields = ("username", "email", "display_name")
    fieldsets = DjangoUserAdmin.fieldsets + (
        (
            "Profile",
            {
                "fields": (
                    "display_name",
                    "avatar",
                    "avatar_preview",
                    "avatar_url",
                    "banner",
                    "banner_preview",
                    "role",
                    "is_guest",
                )
            },
        ),
    )
    readonly_fields = ("avatar_preview", "banner_preview")

    def avatar_preview(self, obj: User):
        if obj.avatar:
            return format_html('<img src="{}" width="64" height="64" />', obj.avatar.url)
        return "-"

    avatar_preview.short_description = "Avatar"

    def banner_preview(self, obj: User):
        if obj.banner:
            return format_html('<img src="{}" width="200" />', obj.banner.url)
        return "-"

    banner_preview.short_description = "Banner"

    @admin.action(description="Ban selected users")
    def ban_users(self, request, queryset) -> None:
        queryset.update(is_active=False)

    @admin.action(description="Unban selected users")
    def unban_users(self, request, queryset) -> None:
        queryset.update(is_active=True)

    actions = (ban_users, unban_users)
