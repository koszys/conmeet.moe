from config.admin_widgets import R2AdminMediaMixin
from django.contrib import admin, messages
from django.db.models import Count
from django.http import HttpRequest, HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.urls import reverse
from django.utils.html import format_html
from django.utils.text import slugify
from meetups.models import Meetup
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import action, display

from .models import Convention, ConventionRequest


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

    def get_changeform_initial_data(self, request):
        initial = super().get_changeform_initial_data(request)
        from_request_id = request.GET.get("from_request")
        if from_request_id:
            try:
                req = ConventionRequest.objects.get(pk=from_request_id)
                initial.setdefault("name", req.name)
                initial.setdefault("slug", slugify(req.name))
                if req.venue_name:
                    initial.setdefault("venue_name", req.venue_name)
                if req.city:
                    initial.setdefault("city", req.city)
                if req.country:
                    initial.setdefault("country", req.country)
                initial.setdefault("starts_at", req.starts_at)
                initial.setdefault("ends_at", req.ends_at)
                if req.website_url:
                    initial.setdefault("website_url", req.website_url)
                if req.map_url:
                    initial.setdefault("map_url", req.map_url)
                if req.banner:
                    initial.setdefault("banner", req.banner)
            except (ConventionRequest.DoesNotExist, ValueError):
                pass
        return initial

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        from_request_id = request.GET.get("from_request") or request.POST.get("_from_request")
        if from_request_id and not change:
            try:
                req = ConventionRequest.objects.get(pk=from_request_id)
                req.status = ConventionRequest.STATUS_APPROVED
                req.created_convention = obj
                if not obj.banner and req.banner:
                    obj.banner = req.banner
                    obj.save(update_fields=["banner"])
                req.save(update_fields=["status", "created_convention", "updated_at"])
                self.message_user(
                    request,
                    f"Convention created from Request #{req.id} ('{req.name}'). Request marked as Approved.",
                    messages.SUCCESS,
                )
            except (ConventionRequest.DoesNotExist, ValueError):
                pass


@admin.register(ConventionRequest)
class ConventionRequestAdmin(R2AdminMediaMixin, ModelAdmin):
    list_display = (
        "name",
        "city",
        "starts_at",
        "ends_at",
        "status_badge",
        "submitted_by_display",
        "created_convention_link",
        "created_at",
    )
    list_filter = ("status", "country", "created_at")
    search_fields = (
        "name",
        "city",
        "venue_name",
        "notes",
        "contact_email",
        "submitted_by__username",
    )
    readonly_fields = (
        "banner_preview",
        "submitted_by",
        "created_convention",
        "created_at",
        "updated_at",
    )
    fieldsets = (
        ("Request Status", {"fields": ("status", "rejection_reason", "created_convention")}),
        (
            "Convention Information",
            {
                "fields": (
                    "name",
                    "venue_name",
                    "city",
                    "country",
                    "starts_at",
                    "ends_at",
                )
            },
        ),
        ("Links & Media", {"fields": ("website_url", "map_url", "banner", "banner_preview")}),
        (
            "Notes & Submitter",
            {
                "fields": (
                    "notes",
                    "contact_email",
                    "submitted_by",
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )
    actions = ["approve_selected_requests", "reject_selected_requests"]
    actions_row = ["convert_to_convention", "reject_request_action"]
    actions_detail = ["convert_to_convention", "reject_request_action"]

    @display(description="Status")
    def status_badge(self, obj: ConventionRequest):
        colors = {
            "pending": "background-color: #fef08a; color: #854d0e;",
            "approved": "background-color: #bbf7d0; color: #166534;",
            "rejected": "background-color: #fecaca; color: #991b1b;",
        }
        style = colors.get(obj.status, "")
        return format_html(
            '<span style="padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; text-transform: uppercase; {}">{}</span>',
            style,
            obj.get_status_display(),
        )

    @display(description="Submitter")
    def submitted_by_display(self, obj: ConventionRequest):
        if obj.submitted_by:
            return obj.submitted_by.username
        if obj.contact_email:
            return f"Guest ({obj.contact_email})"
        return "Guest"

    @display(description="Created Convention")
    def created_convention_link(self, obj: ConventionRequest):
        if obj.created_convention:
            url = reverse("admin:conventions_convention_change", args=[obj.created_convention.id])
            return format_html('<a href="{}" class="font-bold underline">{}</a>', url, obj.created_convention.name)
        return "-"

    @display(description="Banner")
    def banner_preview(self, obj: ConventionRequest):
        if obj.banner:
            return format_html('<img src="{}" width="200" class="rounded" />', obj.banner_thumb.url)
        return "-"

    @action(description="Approve & Create Convention", url_path="convert")
    def convert_to_convention(self, request: HttpRequest, object_id: int):
        return HttpResponseRedirect(
            reverse("admin:conventions_convention_add") + f"?from_request={object_id}"
        )

    @action(description="Reject Request", url_path="reject")
    def reject_request_action(self, request: HttpRequest, object_id: int):
        req = get_object_or_404(ConventionRequest, pk=object_id)
        req.status = ConventionRequest.STATUS_REJECTED
        req.save(update_fields=["status", "updated_at"])
        self.message_user(request, f"Request '{req.name}' marked as rejected.", messages.WARNING)
        return HttpResponseRedirect(
            request.META.get("HTTP_REFERER", reverse("admin:conventions_conventionrequest_changelist"))
        )

    @admin.action(description="Mark selected requests as Rejected")
    def reject_selected_requests(self, request, queryset):
        updated = queryset.update(status=ConventionRequest.STATUS_REJECTED)
        self.message_user(request, f"{updated} request(s) marked as rejected.", messages.WARNING)

    @admin.action(description="Quick-approve selected requests as Conventions")
    def approve_selected_requests(self, request, queryset):
        count = 0
        for req in queryset.filter(status=ConventionRequest.STATUS_PENDING):
            base_slug = slugify(req.name)
            slug = base_slug
            idx = 1
            while Convention.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{idx}"
                idx += 1
            con = Convention.objects.create(
                name=req.name,
                slug=slug,
                venue_name=req.venue_name,
                city=req.city,
                country=req.country,
                starts_at=req.starts_at,
                ends_at=req.ends_at,
                website_url=req.website_url,
                map_url=req.map_url,
                banner=req.banner,
                is_active=True,
            )
            req.status = ConventionRequest.STATUS_APPROVED
            req.created_convention = con
            req.save(update_fields=["status", "created_convention", "updated_at"])
            count += 1
        self.message_user(request, f"{count} convention(s) created and approved.", messages.SUCCESS)
