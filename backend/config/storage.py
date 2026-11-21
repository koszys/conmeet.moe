"""Cloudflare R2 storage backend implementation."""

import contextlib
from typing import Any
from urllib.parse import urlparse

from django.conf import settings
from django.core.files.storage import default_storage
from storages.backends.s3 import S3Storage  # type: ignore[import-untyped]


def delete_image_and_cache(image_field: Any) -> None:
    """Delete a FieldFile/ProcessedImageField and any ImageKit cache derivatives from storage."""
    if not image_field or not getattr(image_field, "name", None):
        return

    image_name = image_field.name
    # 1. Delete original file from storage
    with contextlib.suppress(Exception):
        storage = getattr(image_field, "storage", default_storage)
        storage.delete(image_name)

    # 2. Delete any ImageKit cached thumbnails under CACHE/images/{name_without_ext}/
    bucket = getattr(default_storage, "bucket", None)
    if bucket:
        path_without_ext = image_name.rsplit(".", 1)[0]
        cache_prefix = f"CACHE/images/{path_without_ext}"
        with contextlib.suppress(Exception):
            bucket.objects.filter(Prefix=cache_prefix).delete()


class R2Storage(S3Storage):
    """
    S3Storage backend optimized for Cloudflare R2.
    Handles custom domain URL normalization and R2-specific settings.
    """

    default_acl = None
    file_overwrite = False
    querystring_auth = False
    signature_version = "s3v4"
    addressing_style = "path"

    def __init__(self, **settings_dict: Any) -> None:
        raw_custom_domain = getattr(settings, "AWS_S3_CUSTOM_DOMAIN", None)
        if raw_custom_domain:
            parsed = urlparse(raw_custom_domain)
            clean_domain = parsed.netloc or parsed.path.strip("/")
            settings_dict.setdefault("custom_domain", clean_domain)

        settings_dict.setdefault("region_name", getattr(settings, "AWS_S3_REGION_NAME", "auto"))
        settings_dict.setdefault("default_acl", None)
        settings_dict.setdefault("file_overwrite", False)
        settings_dict.setdefault("querystring_auth", False)
        settings_dict.setdefault("signature_version", "s3v4")

        super().__init__(**settings_dict)
