import uuid

from config.storage import delete_image_and_cache
from conventions.models import Convention
from django.conf import settings
from django.db import models
from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver
from django.utils.text import slugify
from imagekit.models import ImageSpecField, ProcessedImageField
from imagekit.processors import ResizeToFill, ResizeToFit


def freebie_image_upload_path(instance: Freebie, filename: str) -> str:
    ext = filename.split(".")[-1].lower() if "." in filename else "webp"

    # Resolve convention slug
    convention = getattr(instance, "convention", None)
    convention_slug = None
    if convention:
        convention_slug = getattr(convention, "slug", None)
    elif getattr(instance, "convention_id", None):
        try:
            con = Convention.objects.filter(id=instance.convention_id).first()
            if con:
                convention_slug = con.slug
        except Exception:
            convention_slug = None
    if not convention_slug:
        convention_slug = "general"

    # Resolve vendor slug
    vendor = getattr(instance, "vendor", None)
    vendor_slug = None
    if vendor and getattr(vendor, "name", None):
        vendor_slug = slugify(vendor.name)
    elif getattr(instance, "vendor_id", None):
        try:
            v = Vendor.objects.filter(id=instance.vendor_id).first()
            if v and v.name:
                vendor_slug = slugify(v.name)
        except Exception:
            vendor_slug = None
    if not vendor_slug:
        vendor_slug = "drop"

    # Resolve item slug
    item_slug = slugify(instance.name)[:40] if getattr(instance, "name", None) else ""
    if not item_slug:
        item_slug = f"item-{instance.id or uuid.uuid4().hex[:8]}"

    unique_hash = uuid.uuid4().hex[:8]
    return f"freebies/{convention_slug}/{vendor_slug}_{item_slug}_{unique_hash}.{ext}"


freebie_image_upload_path.base_folder = "freebies"  # type: ignore[attr-defined]


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
        constraints = [
            models.UniqueConstraint(
                models.functions.Lower("name"),
                name="unique_vendor_name_case_insensitive",
            )
        ]

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
        upload_to=freebie_image_upload_path,
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
    unmount_freebie = models.BooleanField(
        default=False,
        help_text="Completely unmount and hide this specific freebie.",
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


@receiver(pre_save, sender=Freebie)
def cleanup_freebie_replaced_image(sender, instance: Freebie, **kwargs):
    """When a Freebie's image is replaced or cleared, delete the old file and its cache from R2."""
    if not instance.pk:
        return
    try:
        old_instance = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        return

    old_image = old_instance.image
    new_image = instance.image
    old_name = old_image.name if old_image else None
    new_name = new_image.name if new_image else None

    if old_name and old_name != new_name:
        delete_image_and_cache(old_image)


@receiver(post_delete, sender=Freebie)
def cleanup_freebie_r2_storage(sender, instance: Freebie, **kwargs):
    """Purge R2 image and ImageKit thumbnails when a Freebie is deleted."""
    if instance.image:
        delete_image_and_cache(instance.image)


class FreebieSetting(models.Model):
    unmount_all_freebies = models.BooleanField(
        default=False,
        help_text="Unmount ALL freebie boards across the entire website.",
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Freebie Setting"
        verbose_name_plural = "Freebie Settings"

    def __str__(self) -> str:
        state = "UNMOUNTED (Hidden)" if self.unmount_all_freebies else "Mounted (Active)"
        return f"Global Freebie Settings: {state}"

    @classmethod
    def get_settings(cls) -> "FreebieSetting":
        obj, _ = cls.objects.get_or_create(id=1)
        return obj

