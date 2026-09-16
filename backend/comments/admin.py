from django.contrib import admin
from django.db.models import QuerySet
from django.utils import timezone
from django.utils.html import format_html

from .models import Comment


class StatusListFilter(admin.SimpleListFilter):
    title = "status"
    parameter_name = "status"

    def lookups(self, request, model_admin):
        return (("live", "Live"), ("deleted", "Deleted"))

    def queryset(self, request, queryset: QuerySet) -> QuerySet:
        if self.value() == "deleted":
            return queryset.filter(deleted_at__isnull=False)
        if self.value() == "live":
            return queryset.filter(deleted_at__isnull=True)
        return queryset


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "author", "meetup", "parent", "status", "created_at")
    list_filter = (StatusListFilter, "meetup", "author")
    search_fields = ("body", "author__username", "meetup__name")
    list_select_related = ("author", "meetup", "parent")
    readonly_fields = ("deleted_at",)

    def status(self, obj: Comment):
        return "Deleted" if obj.is_deleted else "Live"

    status.short_description = "Status"

    def author_preview(self, obj: Comment):
        if obj.author.avatar_url:
            return format_html(
                '<img src="{}" width="32" height="32" /> {}',
                obj.author.avatar_url,
                obj.author,
            )
        return str(obj.author)

    author_preview.short_description = "Author"

    @admin.action(description="Soft delete selected comments")
    def soft_delete(self, request, queryset: QuerySet) -> None:
        queryset.update(deleted_at=timezone.now())

    @admin.action(description="Restore selected comments")
    def restore(self, request, queryset: QuerySet) -> None:
        queryset.update(deleted_at=None)

    actions = (soft_delete, restore)
