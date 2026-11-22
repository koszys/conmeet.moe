from django.conf import settings
from django.db import models
from meetups.models import Meetup


class Comment(models.Model):
    meetup = models.ForeignKey(
        Meetup,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="comments",
    )
    album = models.ForeignKey(
        "meetups.MeetupAlbum",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="comments",
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="comments",
    )
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="replies",
    )
    body = models.TextField()
    deleted_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at", "id"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(meetup__isnull=False) | models.Q(album__isnull=False),
                name="comment_has_target",
            )
        ]
        indexes = [
            models.Index(fields=["meetup", "created_at"]),
            models.Index(fields=["album", "created_at"]),
            models.Index(fields=["parent"]),
        ]

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None

    def __str__(self) -> str:
        target = f"Meetup #{self.meetup_id}" if self.meetup_id else f"Album #{self.album_id}"
        return f"{self.author} on {target}: {self.body[:60]}"


class CommentSetting(models.Model):
    unmount_all_comment_sections = models.BooleanField(
        default=False,
        help_text="Unmount ALL comment sections across the entire website.",
    )
    unmount_all_meetup_comments = models.BooleanField(
        default=False,
        help_text="Unmount comment sections on all meetups sitewide.",
    )
    unmount_all_album_comments = models.BooleanField(
        default=False,
        help_text="Unmount comment sections on all albums sitewide.",
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Comment Setting"
        verbose_name_plural = "Comment Settings"

    def __str__(self) -> str:
        state = "UNMOUNTED (Hidden)" if self.unmount_all_comment_sections else "Mounted (Active)"
        return f"Global Comment Settings: {state}"

    @classmethod
    def get_settings(cls) -> CommentSetting:
        obj, _ = cls.objects.get_or_create(id=1)
        return obj
