from conventions.models import Convention
from django.conf import settings
from django.db import models
from imagekit.models import ImageSpecField, ProcessedImageField
from imagekit.processors import ResizeToFill, ResizeToFit


class Vendor(models.Model):
    name = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    website_url = models.URLField(max_length=512, blank=True, null=True)
    image = ProcessedImageField(
        upload_to="vendors/",
        blank=True,
        null=True,
        processors=[ResizeToFit(600, 600)],
        format="WEBP",
        options={"quality": 85},
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Freebie(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name="freebies")
    convention = models.ForeignKey(
        Convention,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="freebies",
    )
    name = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    requirements = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    image = ProcessedImageField(
        upload_to="freebies/",
        blank=True,
        null=True,
        processors=[ResizeToFit(1000, 1000)],
        format="WEBP",
        options={"quality": 85},
    )
    image_thumb = ImageSpecField(
        source="image",
        processors=[ResizeToFill(480, 480)],
        format="JPEG",
        options={"quality": 70},
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="submitted_freebies",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.name


class UserFreebie(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="saved_freebies",
    )
    freebie = models.ForeignKey(Freebie, on_delete=models.CASCADE, related_name="saved_by")
    claimed = models.BooleanField(default=False)
    claimed_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "freebie"], name="unique_user_freebie")
        ]
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.user} saved {self.freebie}"
