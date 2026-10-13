import io
from unittest.mock import patch

import pytest
from config.storage import R2Storage
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.management import call_command

pytestmark = pytest.mark.django_db


def test_default_storage_backend_resolves_and_roundtrips() -> None:
    name = default_storage.save("test.txt", ContentFile(b"hello"))
    try:
        assert default_storage.exists(name)
        assert default_storage.open(name).read() == b"hello"
    finally:
        default_storage.delete(name)


def test_r2_storage_url_formatting() -> None:
    storage = R2Storage(custom_domain="pub-example.r2.dev")
    url = storage.url("avatars/user.webp")
    assert url == "https://pub-example.r2.dev/avatars/user.webp"
    assert "https://https://" not in url


def test_r2_storage_url_formatting_with_full_https_url() -> None:
    with patch.object(settings, "AWS_S3_CUSTOM_DOMAIN", "https://pub-example.r2.dev/"):
        storage = R2Storage()
        url = storage.url("freebies/item.webp")
        assert url == "https://pub-example.r2.dev/freebies/item.webp"
        assert not url.startswith("https://https://")


def test_r2_storage_attributes() -> None:
    storage = R2Storage(custom_domain="media.conmeet.moe")
    assert storage.default_acl is None
    assert storage.file_overwrite is False
    assert storage.querystring_auth is False
    assert storage.signature_version == "s3v4"
    assert storage.addressing_style == "path"


def test_check_r2_command_when_credentials_absent() -> None:
    out = io.StringIO()
    with patch.object(settings, "AWS_ACCESS_KEY_ID", None):
        call_command("check_r2", stdout=out)
    output = out.getvalue()
    assert "R2_ACCESS_KEY_ID is not configured" in output


def test_check_r2_command_with_configured_storage() -> None:
    out = io.StringIO()
    call_command("check_r2", stdout=out)
    output = out.getvalue()
    if getattr(settings, "AWS_ACCESS_KEY_ID", None):
        assert "All Cloudflare R2 tests passed successfully!" in output
    else:
        assert "R2_ACCESS_KEY_ID is not configured" in output
