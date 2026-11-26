import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver
from imagekit.models import ProcessedImageField
from imagekit.processors import ResizeToFill, ResizeToFit

from config.storage import delete_image_and_cache


def user_avatar_upload_path(instance: "User", filename: str) -> str:
    ext = filename.split(".")[-1].lower() if "." in filename else "webp"
    uid = instance.id or "new"
    return f"avatars/user_{uid}/avatar_{uuid.uuid4().hex[:8]}.{ext}"


user_avatar_upload_path.base_folder = "avatars"  # type: ignore[attr-defined]


class UserRole(models.TextChoices):
    USER = "user", "User"
    ADMIN = "admin", "Admin"


class User(AbstractUser):
    username = models.CharField(
        "username",
        max_length=20,
        unique=True,
        help_text="Required. 20 characters or fewer. Letters, digits and @/./+/-/_ only.",
        validators=[AbstractUser.username_validator],
        error_messages={
            "unique": "A user with that username already exists.",
        },
    )
    display_name = models.CharField(max_length=64, blank=True)
    avatar = ProcessedImageField(
        upload_to=user_avatar_upload_path,
        blank=True,
        null=True,
        processors=[ResizeToFill(256, 256)],
        format="WEBP",
        options={"quality": 85},
    )
    avatar_url = models.CharField(max_length=512, blank=True)
    banner = ProcessedImageField(
        upload_to="banners/",
        blank=True,
        null=True,
        processors=[ResizeToFit(1600, 500)],
        format="WEBP",
        options={"quality": 85},
    )
    role = models.CharField(
        max_length=16,
        choices=UserRole.choices,
        default=UserRole.USER,
    )
    is_guest = models.BooleanField(default=False)

    def __str__(self) -> str:
        return self.display_name or self.username or str(self.pk)


@receiver(pre_save, sender=User)
def cleanup_user_replaced_avatar(sender, instance: User, **kwargs):
    """When a User's avatar is replaced or removed, delete the old file and cache from storage/CDN."""
    if not instance.pk:
        return
    try:
        old_instance = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        return

    old_avatar = old_instance.avatar
    new_avatar = instance.avatar
    old_name = old_avatar.name if old_avatar else None
    new_name = new_avatar.name if new_avatar else None

    if old_name and old_name != new_name:
        delete_image_and_cache(old_avatar)


@receiver(post_delete, sender=User)
def cleanup_user_deleted_avatar(sender, instance: User, **kwargs):
    """Purge avatar file and cache from R2 when a user is deleted."""
    if instance.avatar:
        delete_image_and_cache(instance.avatar)
