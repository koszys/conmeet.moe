import contextlib
import uuid

from config.storage import delete_image_and_cache
from conventions.models import Convention
from django.conf import settings
from django.core.files.storage import default_storage
from django.db import models
from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver
from django.utils.text import slugify
from django_quill.fields import QuillField
from imagekit.models import ImageSpecField, ProcessedImageField
from imagekit.processors import ResizeToFill, ResizeToFit


def meetup_banner_upload_path(instance: Meetup, filename: str) -> str:
    ext = filename.split(".")[-1].lower() if "." in filename else "webp"
    slug = instance.slug or (
        slugify(instance.name) if instance.name else f"meetup-{instance.id or uuid.uuid4().hex[:8]}"
    )
    return f"meetups/{slug}/banner_{uuid.uuid4().hex[:8]}.{ext}"


meetup_banner_upload_path.base_folder = "meetups"  # type: ignore[attr-defined]


class Meetup(models.Model):
    convention = models.ForeignKey(Convention, on_delete=models.CASCADE, related_name="meetups")
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, blank=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    image = ProcessedImageField(
        upload_to=meetup_banner_upload_path,
        blank=True,
        null=True,
        processors=[ResizeToFit(1600, 1600)],
        format="WEBP",
        options={"quality": 85},
    )
    image_thumb = ImageSpecField(
        source="image",
        processors=[ResizeToFill(480, 320)],
        format="JPEG",
        options={"quality": 60},
    )
    IMAGE_LAYOUT_CHOICES = [
        ("banner", "Banner"),
        ("poster", "Poster"),
    ]
    image_layout = models.CharField(
        max_length=10,
        choices=IMAGE_LAYOUT_CHOICES,
        default="banner",
        help_text="Display style: 'banner' (landscape) or 'poster' (portrait)",
    )
    description = QuillField(blank=True)
    is_official = models.BooleanField(default=False)
    unmount_comments = models.BooleanField(
        default=False,
        help_text="Completely unmount and hide the comment section for this specific meetup.",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_meetups",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["starts_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["convention", "slug"],
                name="unique_meetup_slug_per_convention",
            )
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name) or "meetup"
            slug = base_slug
            counter = 2
            while (
                Meetup.objects.filter(convention=self.convention, slug=slug)
                .exclude(pk=self.pk)
                .exists()
            ):
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name


class Going(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="going",
    )
    meetup = models.ForeignKey(Meetup, on_delete=models.CASCADE, related_name="going")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "meetup"], name="unique_going")]

    def __str__(self) -> str:
        return f"{self.user} → {self.meetup}"


class SavedMeetup(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="saved_meetups",
    )
    meetup = models.ForeignKey(Meetup, on_delete=models.CASCADE, related_name="saved_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "meetup"], name="unique_saved_meetup")
        ]

    def __str__(self) -> str:
        return f"{self.user} saved {self.meetup}"


class MeetupAlbum(models.Model):
    meetup = models.ForeignKey(Meetup, on_delete=models.CASCADE, related_name="albums")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="meetup_albums",
    )
    title = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    social_links = models.JSONField(default=dict, blank=True)
    cover_photo = models.ForeignKey(
        "MeetupPhoto",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    likes_count = models.PositiveIntegerField(default=0)
    favorites_count = models.PositiveIntegerField(default=0)
    photos_count = models.PositiveIntegerField(default=0)
    unmount_comments = models.BooleanField(
        default=False,
        help_text="Completely unmount and hide the comment section for this specific album.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.title} ({self.meetup.name})"


def meetup_photo_upload_path(instance: MeetupPhoto, filename: str) -> str:
    """
    Generate Cloudflare R2 storage key organized by meetup and album:
    meetups/{meetup_slug}/albums/{album_id}_{album_slug}/{order:02d}_{uuid[:8]}.webp
    """
    ext = "webp"
    unique_id = uuid.uuid4().hex[:8]
    order_val = getattr(instance, "order", 0) or 0
    order_prefix = f"{order_val:02d}"

    # Determine meetup folder
    meetup_slug = "unknown-meetup"
    album = getattr(instance, "album", None)
    if album and getattr(album, "meetup", None):
        meetup = album.meetup
        meetup_slug = meetup.slug or (
            slugify(meetup.name) if getattr(meetup, "name", None) else f"meetup-{meetup.id}"
        )
    elif album and getattr(album, "meetup_id", None):
        meetup_slug = f"meetup-{album.meetup_id}"

    # Determine album folder: {album_id}_{album_slug}
    album_id = (
        getattr(instance, "album_id", None)
        or (album.id if album else None)
        or "pending"
    )
    album_title_slug = ""
    if album and getattr(album, "title", None):
        album_title_slug = slugify(album.title)[:30]

    album_folder = f"{album_id}_{album_title_slug}" if album_title_slug else f"{album_id}"
    return f"meetups/{meetup_slug}/albums/{album_folder}/{order_prefix}_{unique_id}.{ext}"


meetup_photo_upload_path.base_folder = "meetups"  # type: ignore[attr-defined]


class MeetupPhoto(models.Model):
    album = models.ForeignKey(MeetupAlbum, on_delete=models.CASCADE, related_name="photos")
    image = ProcessedImageField(
        upload_to=meetup_photo_upload_path,
        processors=[ResizeToFit(2048, 2048)],
        format="WEBP",
        options={"quality": 85},
    )
    image_thumb = ImageSpecField(
        source="image",
        processors=[ResizeToFill(400, 400)],
        format="WEBP",
        options={"quality": 75},
    )
    caption = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0)
    likes_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "created_at"]

    def __str__(self) -> str:
        return f"Photo {self.id} in {self.album.title}"


class AlbumLike(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="album_likes",
    )
    album = models.ForeignKey(MeetupAlbum, on_delete=models.CASCADE, related_name="likes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "album"], name="unique_album_like")
        ]

    def __str__(self) -> str:
        return f"{self.user} liked album {self.album.id}"


class AlbumFavorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="album_favorites",
    )
    album = models.ForeignKey(
        MeetupAlbum, on_delete=models.CASCADE, related_name="favorites"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "album"], name="unique_album_favorite"
            )
        ]

    def __str__(self) -> str:
        return f"{self.user} favorited album {self.album.id}"


class PhotoLike(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="photo_likes",
    )
    photo = models.ForeignKey(MeetupPhoto, on_delete=models.CASCADE, related_name="likes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "photo"], name="unique_photo_like")
        ]

    def __str__(self) -> str:
        return f"{self.user} liked photo {self.photo.id}"


@receiver(pre_save, sender=Meetup)
def cleanup_meetup_replaced_image(sender, instance: Meetup, **kwargs):
    """When a Meetup banner is replaced or cleared, delete the old file and cache from R2."""
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


@receiver(pre_save, sender=MeetupPhoto)
def cleanup_photo_replaced_image(sender, instance: MeetupPhoto, **kwargs):
    """When a MeetupPhoto's image is replaced, delete the old file and cache from R2."""
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


@receiver(post_delete, sender=Meetup)
def cleanup_meetup_r2_storage(sender, instance: Meetup, **kwargs):
    """Purge R2 banner and all album objects under meetups/{meetup_slug}/."""
    if instance.image:
        delete_image_and_cache(instance.image)
    bucket = getattr(default_storage, "bucket", None)
    if not bucket:
        return
    prefixes = []
    if instance.slug:
        prefixes.append(f"meetups/{instance.slug}/")
    if instance.id:
        prefixes.append(f"meetups/meetup-{instance.id}/")
        prefixes.append(f"meetups/{instance.id}/")
    for prefix in prefixes:
        with contextlib.suppress(Exception):
            bucket.objects.filter(Prefix=prefix).delete()


@receiver(post_delete, sender=MeetupPhoto)
def cleanup_photo_r2_storage(sender, instance: MeetupPhoto, **kwargs):
    """Delete individual photo file and its cache from R2 when photo model is deleted."""
    if instance.image:
        delete_image_and_cache(instance.image)


@receiver(post_delete, sender=MeetupAlbum)
def cleanup_album_r2_storage(sender, instance: MeetupAlbum, **kwargs):
    """Purge all R2 storage objects under the album's prefix when album is deleted."""
    bucket = getattr(default_storage, "bucket", None)
    if not bucket or not instance.id:
        return
    meetup_slug = (
        getattr(instance.meetup, "slug", None) if getattr(instance, "meetup", None) else None
    )
    prefixes = []
    if meetup_slug:
        prefixes.append(f"meetups/{meetup_slug}/albums/{instance.id}")
    if instance.meetup_id:
        prefixes.append(f"meetups/meetup-{instance.meetup_id}/albums/{instance.id}")
        prefixes.append(f"meetups/{instance.meetup_id}/albums/{instance.id}")
    for prefix in prefixes:
        with contextlib.suppress(Exception):
            bucket.objects.filter(Prefix=prefix).delete()
