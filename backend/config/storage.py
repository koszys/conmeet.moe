"""Cloudflare R2 storage backend implementation."""

from typing import Any
from urllib.parse import urlparse

from django.conf import settings
from storages.backends.s3 import S3Storage  # type: ignore[import-untyped]


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
