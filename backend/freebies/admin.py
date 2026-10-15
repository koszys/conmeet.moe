from config.admin_widgets import R2AdminMediaMixin
from django.contrib import admin
from django.db.models import Count
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import display

from .models import Freebie, UserFreebie, Vendor


class FreebieInline(TabularInline):
    model = Freebie
    extra = 0
    fields = ("name", "convention", "location", "created_at")
    readonly_fields = ("created_at",)
    show_change_link = True


@admin.register(Vendor)
class VendorAdmin(R2AdminMediaMixin, ModelAdmin):
    list_display = ("name", "website_url", "freebie_count", "created_at")
    search_fields = ("name", "description")
    inlines = [FreebieInline]

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_freebie_count=Count("freebies"))

    @display(description="Freebies", ordering="_freebie_count")
    def freebie_count(self, obj) -> int:
        return getattr(obj, "_freebie_count", obj.freebies.count())


@admin.register(Freebie)
class FreebieAdmin(R2AdminMediaMixin, ModelAdmin):
    list_display = ("name", "vendor", "convention", "location", "created_by", "created_at")
    list_select_related = ("vendor", "convention", "created_by")
    list_filter = ("convention", "vendor", "created_at")
    search_fields = ("name", "description", "requirements", "location", "vendor__name")
    raw_id_fields = ("created_by",)


@admin.register(UserFreebie)
class UserFreebieAdmin(ModelAdmin):
    list_display = ("user", "freebie", "claimed", "claimed_at", "created_at")
    list_select_related = ("user", "freebie")
    list_filter = ("claimed", "created_at")
    search_fields = ("user__username", "user__display_name", "user__email", "freebie__name")
    raw_id_fields = ("user", "freebie")
