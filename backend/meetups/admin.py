from config.admin_widgets import R2AdminMediaMixin
from django.contrib import admin
from django.db.models import Count
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import display

from .models import Going, Meetup, SavedMeetup


class GoingInline(TabularInline):
    model = Going
    extra = 0
    readonly_fields = ("user", "created_at")


@admin.register(Meetup)
class MeetupAdmin(R2AdminMediaMixin, ModelAdmin):
    list_display = ("name", "convention", "starts_at", "is_official", "going_count")
    list_filter = ("is_official", "convention")
    search_fields = ("name", "location", "convention__name")
    list_editable = ("is_official",)
    inlines = (GoingInline,)
    fieldsets = (
        (
            None,
            {"fields": ("convention", "name", "location", "starts_at", "ends_at", "is_official")},
        ),
        ("Media", {"fields": ("image", "image_preview")}),
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
