import pytest


@pytest.fixture(autouse=True)
def isolated_media_storage(tmp_path, settings):
    """
    Ensure all tests run with isolated temporary FileSystemStorage.
    Completely isolates tests from live Cloudflare R2 storage and prevents test leakage.
    """
    media_dir = tmp_path / "test_media"
    media_dir.mkdir(parents=True, exist_ok=True)
    settings.MEDIA_ROOT = str(media_dir)
    settings.MEDIA_URL = "/media/"
    settings.AWS_ACCESS_KEY_ID = None
    settings.AWS_SECRET_ACCESS_KEY = None
    settings.AWS_STORAGE_BUCKET_NAME = None
    settings.AWS_S3_CUSTOM_DOMAIN = None
    settings.STORAGES = {
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
            "OPTIONS": {"location": str(media_dir), "base_url": "/media/"},
        },
        "staticfiles": settings.STORAGES.get(
            "staticfiles",
            {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
        ),
    }
