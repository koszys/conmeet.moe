from config.admin_widgets import R2AdminMediaMixin
from django.contrib import admin
from django.db.models import Count
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import display

from .models import (
    AlbumFavorite,
    AlbumLike,
    Going,
    Meetup,
    MeetupAlbum,
    MeetupPhoto,
    PhotoLike,
    SavedMeetup,
)


class GoingInline(TabularInline):
    model = Going
    extra = 0
    readonly_fields = ("user", "created_at")


class MeetupAlbumInline(TabularInline):
    model = MeetupAlbum
    extra = 0
    fields = ("title", "created_by", "photos_count", "likes_count", "created_at")
    readonly_fields = ("photos_count", "likes_count", "created_at")
    show_change_link = True


@admin.register(Meetup)
class MeetupAdmin(R2AdminMediaMixin, ModelAdmin):
    list_display = ("name", "slug", "convention", "starts_at", "is_official", "going_count")
    list_filter = ("is_official", "convention")
    search_fields = ("name", "slug", "location", "convention__name")
    list_editable = ("is_official",)
    prepopulated_fields = {"slug": ("name",)}
    inlines = (GoingInline, MeetupAlbumInline)
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "convention",
                    "name",
                    "slug",
                    "location",
                    "starts_at",
                    "ends_at",
                    "is_official",
                )
            },
        ),
        ("Media", {"fields": ("image", "image_layout", "image_preview")}),
        ("Content", {"fields": ("description",)}),
    )
    readonly_fields = ("image_preview",)

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("convention")
            .annotate(_going_count=Count("going"))
        )

    @display(description="Going", ordering="_going_count")
    def going_count(self, obj: Meetup) -> int:
        return obj._going_count

    @display(description="Image")
    def image_preview(self, obj: Meetup):
        if obj.image:
            return format_html('<img src="{}" width="200" class="rounded" />', obj.image_thumb.url)
        return "-"


@admin.register(Going)
class GoingAdmin(ModelAdmin):
    list_display = ("user", "meetup", "created_at")
    search_fields = ("user__username", "meetup__name")


@admin.register(SavedMeetup)
class SavedMeetupAdmin(ModelAdmin):
    list_display = ("user", "meetup", "created_at")
    search_fields = ("user__username", "meetup__name")


class MeetupPhotoInline(TabularInline):
    model = MeetupPhoto
    extra = 0
    fields = ("image_preview", "image", "caption", "order", "likes_count", "created_at")
    readonly_fields = ("image_preview", "likes_count", "created_at")

    @display(description="Preview")
    def image_preview(self, obj: MeetupPhoto):
        if obj.image:
            return format_html(
                '<img src="{}" width="60" height="60" '
                'style="object-fit:cover; border-radius:4px;" />',
                obj.image_thumb.url,
            )
        return "-"


@admin.register(MeetupAlbum)
class MeetupAlbumAdmin(ModelAdmin):
    list_display = (
        "title",
        "meetup",
        "created_by",
        "photos_count",
        "likes_count",
        "favorites_count",
        "created_at",
    )
    list_filter = ("meetup__convention", "meetup")
    search_fields = ("title", "description", "created_by__username", "meetup__name")
    readonly_fields = ("photos_count", "likes_count", "favorites_count", "created_at", "updated_at")
    inlines = (MeetupPhotoInline,)


@admin.register(MeetupPhoto)
class MeetupPhotoAdmin(R2AdminMediaMixin, ModelAdmin):
    list_display = ("id", "image_preview", "album", "caption", "order", "likes_count", "created_at")
    list_filter = ("album__meetup__convention", "album__meetup")
    search_fields = ("caption", "album__title", "album__created_by__username")
    readonly_fields = ("image_preview", "likes_count", "created_at")

    @display(description="Preview")
    def image_preview(self, obj: MeetupPhoto):
        if obj.image:
            return format_html(
                '<img src="{}" width="100" height="100" '
                'style="object-fit:cover; border-radius:6px;" />',
                obj.image_thumb.url,
            )
        return "-"


@admin.register(AlbumLike)
class AlbumLikeAdmin(ModelAdmin):
    list_display = ("user", "album", "created_at")
    search_fields = ("user__username", "album__title")


@admin.register(AlbumFavorite)
class AlbumFavoriteAdmin(ModelAdmin):
    list_display = ("user", "album", "created_at")
    search_fields = ("user__username", "album__title")


@admin.register(PhotoLike)
class PhotoLikeAdmin(ModelAdmin):
    list_display = ("user", "photo", "created_at")
    search_fields = ("user__username", "photo__album__title")

