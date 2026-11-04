from django.conf import settings
from django.db import models
from django_quill.fields import QuillField
from imagekit.models import ImageSpecField, ProcessedImageField
from imagekit.processors import ResizeToFill, ResizeToFit


class Convention(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=120, unique=True)
    venue_name = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=120, blank=True, null=True)
    country = models.CharField(max_length=120, blank=True, null=True)
    starts_at = models.DateField()
    ends_at = models.DateField()
    banner = ProcessedImageField(
        upload_to="conventions/banners/",
        blank=True,
        null=True,
        processors=[ResizeToFit(1600, 800)],
        format="WEBP",
        options={"quality": 85},
    )
    banner_thumb = ImageSpecField(
        source="banner",
        processors=[ResizeToFill(640, 360)],
        format="JPEG",
        options={"quality": 60},
    )
    description = QuillField(blank=True)
    website_url = models.URLField(max_length=512, blank=True, null=True)
    map_url = models.URLField(max_length=512, blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    featured_priority = models.PositiveIntegerField(
        blank=True,
        null=True,
        default=None,
        help_text=(
            "Display order in featured slider (1 = first, 2 = second, etc.). "
            "If blank, sorted by closest date."
        ),
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-starts_at"]

    def __str__(self) -> str:
        return self.name


class ConventionRequest(models.Model):
    STATUS_PENDING = "pending"
    STATUS_APPROVED = "approved"
    STATUS_REJECTED = "rejected"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_REJECTED, "Rejected"),
    ]

    name = models.CharField(max_length=120)
    venue_name = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=120, blank=True, null=True)
    country = models.CharField(max_length=120, blank=True, null=True)
    starts_at = models.DateField()
    ends_at = models.DateField()
    website_url = models.URLField(max_length=512, blank=True, null=True)
    map_url = models.URLField(max_length=512, blank=True, null=True)
    banner = ProcessedImageField(
        upload_to="conventions/request_banners/",
        blank=True,
        null=True,
        processors=[ResizeToFit(1600, 800)],
        format="WEBP",
        options={"quality": 85},
    )
    banner_thumb = ImageSpecField(
        source="banner",
        processors=[ResizeToFill(640, 360)],
        format="JPEG",
        options={"quality": 60},
    )
    notes = models.TextField(blank=True, help_text="Additional notes or links from submitter")
    contact_email = models.EmailField(blank=True, null=True)
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="convention_requests",
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    created_convention = models.OneToOneField(
        Convention,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="request_source",
    )
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.name} ({self.get_status_display()})"
