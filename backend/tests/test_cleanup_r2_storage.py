import io
from datetime import UTC, datetime
from unittest.mock import MagicMock, patch

import pytest
from conventions.models import Convention
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.utils import timezone
from freebies.models import Freebie, Vendor
from meetups.models import Meetup

User = get_user_model()


class MockS3Object:
    def __init__(self, key: str, size: int = 1024):
        self.key = key
        self.size = size


@pytest.mark.django_db
def test_cleanup_r2_storage_when_no_bucket():
    out = io.StringIO()
    call_command("cleanup_r2_storage", dry_run=True, stdout=out)
    output = out.getvalue()
    assert "Cloudflare R2 bucket is not configured" in output


@pytest.mark.django_db
def test_cleanup_r2_storage_dry_run_and_execution():
    user = User.objects.create_user(username="cleaner", email="cleaner@conmeet.moe")
    con = Convention.objects.create(
        name="Test Con",
        slug="test-con",
        starts_at=timezone.now().date(),
        ends_at=timezone.now().date(),
        banner="conventions/banners/active_con.webp",
    )
    ven = Vendor.objects.create(name="Active Vendor")
    Freebie.objects.create(
        name="Active Freebie",
        convention=con,
        vendor=ven,
        image="freebies/test-con/active_freebie.webp",
    )
    Meetup.objects.create(
        convention=con,
        created_by=user,
        name="Active Meetup",
        starts_at=datetime(2027, 7, 2, 12, 0, tzinfo=UTC),
        ends_at=datetime(2027, 7, 2, 14, 0, tzinfo=UTC),
        image="meetups/test-con/active_meetup.webp",
    )

    mock_objects = [
        # Active media
        MockS3Object("conventions/banners/active_con.webp", 5000),
        MockS3Object("freebies/test-con/active_freebie.webp", 3000),
        MockS3Object("meetups/test-con/active_meetup.webp", 4000),
        # Active cache
        MockS3Object("CACHE/images/conventions/banners/active_con/thumb1.jpg", 1000),
        MockS3Object("CACHE/images/freebies/test-con/active_freebie/thumb2.jpg", 800),
        MockS3Object("CACHE/images/meetups/test-con/active_meetup/thumb3.jpg", 900),
        # Orphaned media
        MockS3Object("meetups/old-meetup/orphaned_banner.webp", 2500),
        MockS3Object("_r2_test_probe.txt", 50),
        # Orphaned cache
        MockS3Object("CACHE/images/meetups/deleted_meetup/cache_file.webp", 600),
    ]

    mock_bucket = MagicMock()
    mock_bucket.objects.all.return_value = mock_objects

    mock_storage = MagicMock()
    mock_storage.bucket = mock_bucket

    # 1. Test Dry Run
    out_dry = io.StringIO()
    with patch("accounts.management.commands.cleanup_r2_storage.default_storage", mock_storage):
        call_command("cleanup_r2_storage", dry_run=True, stdout=out_dry)

    dry_output = out_dry.getvalue()
    assert "Found 3 active media file(s) in database." in dry_output
    assert "Total objects in bucket: 9" in dry_output
    assert "Retained objects:        6 (3 media, 3 cache)" in dry_output
    assert "Orphaned objects to delete: 3 (2 media, 1 cache)" in dry_output
    assert "[orphaned_media] meetups/old-meetup/orphaned_banner.webp" in dry_output
    assert "[orphaned_media] _r2_test_probe.txt" in dry_output
    assert "[orphaned_cache] CACHE/images/meetups/deleted_meetup/cache_file.webp" in dry_output
    mock_bucket.delete_objects.assert_not_called()

    # 2. Test Execution with --no-input
    out_exec = io.StringIO()
    with patch("accounts.management.commands.cleanup_r2_storage.default_storage", mock_storage):
        call_command("cleanup_r2_storage", no_input=True, stdout=out_exec)

    exec_output = out_exec.getvalue()
    assert "Successfully purged 3 orphaned object(s) from Cloudflare R2" in exec_output
    mock_bucket.delete_objects.assert_called_once()
    deleted_payload = mock_bucket.delete_objects.call_args[1]["Delete"]["Objects"]
    deleted_keys = {item["Key"] for item in deleted_payload}
    assert deleted_keys == {
        "meetups/old-meetup/orphaned_banner.webp",
        "_r2_test_probe.txt",
        "CACHE/images/meetups/deleted_meetup/cache_file.webp",
    }
