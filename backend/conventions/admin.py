from config.admin_widgets import R2AdminMediaMixin
from django.contrib import admin
from django.db.models import Count
from django.utils.html import format_html
from meetups.models import Meetup
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import display

from .models import Convention


class MeetupInline(TabularInline):
    model = Meetup
    extra = 0
    show_change_link = True
    fields = ("name", "starts_at", "ends_at", "is_official", "going_count")
    readonly_fields = ("going_count",)

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_going_count=Count("going"))

    @display(description="Going", ordering="_going_count")
    def going_count(self, obj: Meetup) -> int:
        return getattr(obj, "_going_count", 0)


@admin.register(Convention)
class ConventionAdmin(R2AdminMediaMixin, ModelAdmin):
    list_display = (
        "name",
        "slug",
        "city",
        "starts_at",
        "ends_at",
        "is_featured",
        "is_active",
        "featured_priority",
        "meetup_count",
    )
    list_editable = ("is_featured", "is_active", "featured_priority")
    list_filter = ("is_featured", "is_active", "country")
    search_fields = ("name", "slug", "city")
    prepopulated_fields = {"slug": ("name",)}
    inlines = (MeetupInline,)
    fieldsets = (
        (None, {"fields": ("name", "slug", "website_url", "map_url")}),
        ("Details", {"fields": ("venue_name", "city", "country", "starts_at", "ends_at")}),
        ("Media", {"fields": ("banner", "banner_preview")}),
        (
            "Content",
            {
                "fields": (
                    "description",
                    ("is_featured", "is_active"),
                    "featured_priority",
                )
            },
        ),
    )
    readonly_fields = ("banner_preview",)

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_meetup_count=Count("meetups"))

    @display(description="Meetups", ordering="_meetup_count")
    def meetup_count(self, obj: Convention) -> int:
        return obj._meetup_count

    @display(description="Banner")
    def banner_preview(self, obj: Convention):
        if obj.banner:
            return format_html('<img src="{}" width="200" class="rounded" />', obj.banner_thumb.url)
        return "-"
