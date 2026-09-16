from django.contrib.auth.models import AbstractUser
from django.db import models
from imagekit.models import ProcessedImageField
from imagekit.processors import ResizeToFill, ResizeToFit


class UserRole(models.TextChoices):
    USER = "user", "User"
    ADMIN = "admin", "Admin"


class User(AbstractUser):
    display_name = models.CharField(max_length=64, blank=True)
    avatar = ProcessedImageField(
        upload_to="avatars/",
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
