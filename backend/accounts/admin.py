from allauth.account.admin import EmailAddressAdmin as BaseEmailAddressAdmin
from allauth.account.models import EmailAddress
from allauth.socialaccount.admin import SocialAccountAdmin as BaseSocialAccountAdmin
from allauth.socialaccount.models import SocialAccount
from config.admin_widgets import R2AdminMediaMixin
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import display
from unfold.forms import AdminPasswordChangeForm, UserChangeForm, UserCreationForm

from .models import User

# Unregister default allauth admins to replace them with Unfold-enhanced admins
admin.site.unregister(EmailAddress)
admin.site.unregister(SocialAccount)


@admin.register(EmailAddress)
class EmailAddressAdmin(ModelAdmin, BaseEmailAddressAdmin):
    pass


@admin.register(SocialAccount)
class SocialAccountAdmin(ModelAdmin, BaseSocialAccountAdmin):
    pass


class EmailAddressInline(TabularInline):
    model = EmailAddress
    extra = 0


class SocialAccountInline(TabularInline):
    model = SocialAccount
    extra = 0
    readonly_fields = ("provider", "uid", "last_login", "date_joined")
    can_delete = False


@admin.register(User)
class UserAdmin(R2AdminMediaMixin, ModelAdmin, DjangoUserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm
    change_password_form = AdminPasswordChangeForm
    inlines = (EmailAddressInline, SocialAccountInline)
    list_display = (
        "username",
        "email",
        "display_name",
        "role_badge",
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

    @display(
        description="Role",
        label={
            "admin": "danger",
            "user": "info",
        },
    )
    def role_badge(self, obj: User) -> str:
        return obj.role

    @display(description="Avatar")
    def avatar_preview(self, obj: User):
        if obj.avatar:
            return format_html(
                '<img src="{}" width="64" height="64" class="rounded-full" />',
                obj.avatar.url,
            )
        return "-"

    @display(description="Banner")
    def banner_preview(self, obj: User):
        if obj.banner:
            return format_html('<img src="{}" width="200" class="rounded" />', obj.banner.url)
        return "-"

    @admin.action(description="Ban selected users")
    def ban_users(self, request, queryset) -> None:
        queryset.update(is_active=False)

    @admin.action(description="Unban selected users")
    def unban_users(self, request, queryset) -> None:
        queryset.update(is_active=True)

    actions = (ban_users, unban_users)
