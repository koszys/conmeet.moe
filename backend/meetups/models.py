from conventions.models import Convention
from django.conf import settings
from django.db import models
from django_quill.fields import QuillField
from imagekit.models import ImageSpecField, ProcessedImageField
from imagekit.processors import ResizeToFill, ResizeToFit


class Meetup(models.Model):
    convention = models.ForeignKey(Convention, on_delete=models.CASCADE, related_name="meetups")
    name = models.CharField(max_length=120)
    location = models.CharField(max_length=255, blank=True, null=True)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    image = ProcessedImageField(
        upload_to="meetups/",
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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.title} ({self.meetup.name})"


class MeetupPhoto(models.Model):
    album = models.ForeignKey(MeetupAlbum, on_delete=models.CASCADE, related_name="photos")
    image = ProcessedImageField(
        upload_to="meetups/albums/%Y/%m/",
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
