from django.contrib import admin
from unfold.admin import ModelAdmin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(ModelAdmin):
    list_display = ("user", "type", "actor", "is_read", "created_at")
    list_filter = ("type", "is_read")
    search_fields = ("user__username", "actor__username")
