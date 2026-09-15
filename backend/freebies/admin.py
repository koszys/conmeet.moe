from django.contrib import admin

from .models import Freebie, UserFreebie, Vendor


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ("name", "website_url", "created_at")
    search_fields = ("name", "description")


@admin.register(Freebie)
class FreebieAdmin(admin.ModelAdmin):
    list_display = ("name", "vendor", "convention", "location")
    list_select_related = ("vendor", "convention")
    list_filter = ("vendor", "convention")
    search_fields = ("name", "description", "vendor__name")


@admin.register(UserFreebie)
class UserFreebieAdmin(admin.ModelAdmin):
    list_display = ("user", "freebie", "claimed", "claimed_at")
    list_filter = ("claimed",)
    search_fields = ("user__username", "freebie__name")
