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
        processors=[ResizeToFit(1000, 1000)],
        format="WEBP",
        options={"quality": 85},
    )
    image_thumb = ImageSpecField(
        source="image",
        processors=[ResizeToFill(480, 320)],
        format="JPEG",
        options={"quality": 60},
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
