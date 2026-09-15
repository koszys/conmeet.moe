from django.db import models
from django_quill.fields import QuillField


class Convention(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=120, unique=True)
    venue_name = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=120, blank=True, null=True)
    country = models.CharField(max_length=120, blank=True, null=True)
    starts_at = models.DateField()
    ends_at = models.DateField()
    banner = models.ImageField(
        upload_to="conventions/banners/", blank=True, null=True
    )
    description = QuillField(blank=True)
    website_url = models.URLField(max_length=512, blank=True, null=True)
    map_url = models.URLField(max_length=512, blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-starts_at"]

    def __str__(self) -> str:
        return self.name