import io
from io import BytesIO
from unittest.mock import MagicMock, patch

import pytest
from conventions.models import Convention
from django.core.files.storage import default_storage
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.utils import timezone
from freebies.models import Freebie, Vendor, freebie_image_upload_path
from freebies.serializers import FreebieUpdateSerializer
from PIL import Image


def _create_test_image(name: str = "test.webp", color: str = "blue") -> SimpleUploadedFile:
    img = Image.new("RGB", (100, 100), color=color)
    buf = BytesIO()
    img.save(buf, format="WEBP")
    return SimpleUploadedFile(name, buf.getvalue(), content_type="image/webp")


@pytest.fixture
def convention(db) -> Convention:
    return Convention.objects.create(
        name="Sakura-Con 2027",
        slug="sakura-con-2027",
        starts_at=timezone.now().date(),
        ends_at=timezone.now().date(),
    )


@pytest.fixture
def vendor(db) -> Vendor:
    return Vendor.objects.create(name="Kuro Games")


@pytest.mark.django_db
def test_freebie_image_upload_path_with_convention_and_vendor(
    convention: Convention, vendor: Vendor
):
    freebie = Freebie(
        convention=convention,
        vendor=vendor,
        name="Cartethyia Pin",
    )
    path = freebie_image_upload_path(freebie, "sample.png")
    assert path.startswith("freebies/sakura-con-2027/kuro-games_cartethyia-pin_")
    assert path.endswith(".png")


@pytest.mark.django_db
def test_freebie_image_upload_path_fallback_when_no_convention(vendor: Vendor):
    freebie = Freebie(
        convention=None,
        vendor=vendor,
        name="Mystery Drop",
    )
    path = freebie_image_upload_path(freebie, "drop.webp")
    assert path.startswith("freebies/general/kuro-games_mystery-drop_")
    assert path.endswith(".webp")


@pytest.mark.django_db
def test_freebie_image_upload_path_base_folder_attribute():
    assert getattr(freebie_image_upload_path, "base_folder", None) == "freebies"


@pytest.mark.django_db
def test_replacing_image_deletes_old_image_from_storage(convention: Convention, vendor: Vendor):
    # 1. Create a freebie with an initial image
    initial_file = _create_test_image("initial.webp", color="red")
    freebie = Freebie.objects.create(
        convention=convention,
        vendor=vendor,
        name="Sticker Pack",
        image=initial_file,
    )
    old_storage_key = freebie.image.name
    assert old_storage_key is not None
    assert default_storage.exists(old_storage_key)

    # 2. Replace with a new image via FreebieUpdateSerializer
    replacement_file = _create_test_image("replacement.webp", color="green")
    serializer = FreebieUpdateSerializer(
        instance=freebie,
        data={"image": replacement_file},
        partial=True,
    )
    assert serializer.is_valid(), serializer.errors
    updated_freebie = serializer.save()

    new_storage_key = updated_freebie.image.name
    assert new_storage_key is not None
    assert new_storage_key != old_storage_key

    # 3. Assert old file was purged and new file exists
    assert not default_storage.exists(
        old_storage_key
    ), "Old replaced image should be deleted from storage"
    assert default_storage.exists(new_storage_key), "New image should exist in storage"

    # Cleanup
    if default_storage.exists(new_storage_key):
        default_storage.delete(new_storage_key)


@pytest.mark.django_db
def test_replacing_image_via_model_save(convention: Convention, vendor: Vendor):
    # 1. Create a freebie with an initial image
    initial_file = _create_test_image("first.webp", color="blue")
    freebie = Freebie.objects.create(
        convention=convention,
        vendor=vendor,
        name="Art Print",
        image=initial_file,
    )
    old_key = freebie.image.name
    assert default_storage.exists(old_key)

    # 2. Assign replacement image directly on model and save (simulates admin form)
    replacement_file = _create_test_image("second.webp", color="yellow")
    freebie.image = replacement_file
    freebie.save()

    new_key = freebie.image.name
    assert new_key != old_key
    assert not default_storage.exists(
        old_key
    ), "Old image should be deleted on direct model re-save"
    assert default_storage.exists(new_key)

    # Cleanup
    if default_storage.exists(new_key):
        default_storage.delete(new_key)


@pytest.mark.django_db
def test_clearing_image_deletes_image_from_storage(convention: Convention, vendor: Vendor):
    initial_file = _create_test_image("clear_me.webp", color="purple")
    freebie = Freebie.objects.create(
        convention=convention,
        vendor=vendor,
        name="Keyring",
        image=initial_file,
    )
    old_key = freebie.image.name
    assert default_storage.exists(old_key)

    # Clear image via update serializer
    serializer = FreebieUpdateSerializer(
        instance=freebie,
        data={"clear_image": True},
        partial=True,
    )
    assert serializer.is_valid(), serializer.errors
    updated_freebie = serializer.save()

    assert not updated_freebie.image
    assert not default_storage.exists(old_key), "Cleared image should be removed from storage"


@pytest.mark.django_db
def test_deleting_freebie_purges_image_from_storage(convention: Convention, vendor: Vendor):
    file = _create_test_image("delete_me.webp", color="black")
    freebie = Freebie.objects.create(
        convention=convention,
        vendor=vendor,
        name="Poster",
        image=file,
    )
    key = freebie.image.name
    assert default_storage.exists(key)

    freebie.delete()
    assert not default_storage.exists(key), "Deleted freebie image should be purged from storage"


@pytest.mark.django_db
def test_updating_non_image_fields_preserves_image(convention: Convention, vendor: Vendor):
    file = _create_test_image("preserve_me.webp", color="orange")
    freebie = Freebie.objects.create(
        convention=convention,
        vendor=vendor,
        name="Original Name",
        image=file,
    )
    key = freebie.image.name
    assert default_storage.exists(key)

    # Update only the name and location
    freebie.name = "New Item Name"
    freebie.location = "Booth 404"
    freebie.save()

    assert freebie.image.name == key
    assert default_storage.exists(key), "Updating text fields must not delete existing image"

    # Cleanup
    if default_storage.exists(key):
        default_storage.delete(key)


@pytest.mark.django_db
def test_delete_image_and_cache_purges_r2_thumbnails():
    from config.storage import delete_image_and_cache

    mock_bucket = MagicMock()
    mock_storage = MagicMock()

    mock_image = MagicMock()
    mock_image.name = "freebies/sakura-con-2027/item_abc123.webp"
    mock_image.storage = mock_storage

    with patch("config.storage.default_storage") as mock_ds:
        mock_ds.bucket = mock_bucket
        delete_image_and_cache(mock_image)

    # Verify primary storage delete was called
    mock_storage.delete.assert_called_once_with("freebies/sakura-con-2027/item_abc123.webp")
    # Verify CACHE thumbnail purge prefix filter was called
    mock_bucket.objects.filter.assert_called_once_with(
        Prefix="CACHE/images/freebies/sakura-con-2027/item_abc123"
    )
    mock_bucket.objects.filter.return_value.delete.assert_called_once()


@pytest.mark.django_db
def test_reorganize_freebie_r2_storage_dry_run(convention: Convention, vendor: Vendor):
    out = io.StringIO()
    # Create freebie with simulated legacy key
    freebie = Freebie.objects.create(
        convention=convention,
        vendor=vendor,
        name="Legacy Banner",
        image="freebies/legacy_banner.webp",
    )

    call_command("reorganize_freebie_r2_storage", dry_run=True, stdout=out)
    output = out.getvalue()

    assert "Running in DRY-RUN mode" in output
    assert f"Freebie #{freebie.id}" in output
    expected_preview = "freebies/legacy_banner.webp -> freebies/sakura-con-2027/kuro-games_"
    assert expected_preview in output
