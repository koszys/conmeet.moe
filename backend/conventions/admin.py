from django.contrib import admin
from django.db.models import Count
from django.utils.html import format_html
from meetups.models import Meetup

from .models import Convention


class MeetupInline(admin.TabularInline):
    model = Meetup
    extra = 0
    show_change_link = True
    fields = ("name", "starts_at", "ends_at", "is_official", "going_count")

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_going_count=Count("going"))

    def going_count(self, obj: Meetup) -> int:
        return obj._going_count

    going_count.short_description = "Going"


@admin.register(Convention)
class ConventionAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "slug",
        "city",
        "starts_at",
        "ends_at",
        "is_featured",
        "is_active",
        "meetup_count",
    )
    list_filter = ("is_featured", "is_active", "country")
    search_fields = ("name", "slug", "city")
    prepopulated_fields = {"slug": ("name",)}
    inlines = (MeetupInline,)
    fieldsets = (
        (None, {"fields": ("name", "slug", "website_url", "map_url")}),
        ("Details", {"fields": ("venue_name", "city", "country", "starts_at", "ends_at")}),
        ("Media", {"fields": ("banner", "banner_preview")}),
        ("Content", {"fields": ("description", "is_featured", "is_active")}),
    )
    readonly_fields = ("banner_preview",)

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_meetup_count=Count("meetups"))

    def meetup_count(self, obj: Convention) -> int:
        return obj._meetup_count

    meetup_count.short_description = "Meetups"

    def banner_preview(self, obj: Convention):
        if obj.banner:
            return format_html('<img src="{}" width="200" />', obj.banner_thumb.url)
        return "-"

    banner_preview.short_description = "Banner"
