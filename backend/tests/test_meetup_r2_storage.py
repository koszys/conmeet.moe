from datetime import UTC, datetime
from io import BytesIO
from unittest.mock import MagicMock, patch

import pytest
from conventions.models import Convention
from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from meetups.models import Meetup, MeetupAlbum, MeetupPhoto
from meetups.serializers import MeetupUpdateSerializer
from PIL import Image

User = get_user_model()


def _create_test_image(name: str = "banner.webp", color: str = "blue") -> SimpleUploadedFile:
    img = Image.new("RGB", (100, 100), color=color)
    buf = BytesIO()
    img.save(buf, format="WEBP")
    return SimpleUploadedFile(name, buf.getvalue(), content_type="image/webp")


@pytest.fixture
def convention(db) -> Convention:
    return Convention.objects.create(
        name="Anime Expo 2027",
        slug="anime-expo-2027",
        starts_at=timezone.now().date(),
        ends_at=timezone.now().date(),
    )


@pytest.fixture
def user(db):
    return User.objects.create_user(username="testorganizer", email="organizer@conmeet.moe")


@pytest.mark.django_db
def test_replacing_meetup_image_via_serializer_deletes_old_image(
    convention: Convention, user
):
    # 1. Create a meetup with an initial banner image
    initial_file = _create_test_image("initial_banner.webp", color="red")
    meetup = Meetup.objects.create(
        convention=convention,
        created_by=user,
        name="Genshin Cosplay Meetup",
        starts_at=datetime(2027, 7, 2, 12, 0, tzinfo=UTC),
        ends_at=datetime(2027, 7, 2, 14, 0, tzinfo=UTC),
        image=initial_file,
    )
    old_storage_key = meetup.image.name
    assert old_storage_key is not None
    assert default_storage.exists(old_storage_key)

    # 2. Replace with a new banner via MeetupUpdateSerializer
    replacement_file = _create_test_image("replacement_banner.webp", color="green")
    serializer = MeetupUpdateSerializer(
        instance=meetup,
        data={"image": replacement_file},
        partial=True,
    )
    assert serializer.is_valid(), serializer.errors
    updated_meetup = serializer.save()

    new_storage_key = updated_meetup.image.name
    assert new_storage_key is not None
    assert new_storage_key != old_storage_key

    # 3. Assert old banner was purged and new banner exists
    assert not default_storage.exists(
        old_storage_key
    ), "Old replaced meetup image should be deleted from storage"
    assert default_storage.exists(new_storage_key), "New banner should exist in storage"

    # Cleanup
    if default_storage.exists(new_storage_key):
        default_storage.delete(new_storage_key)


@pytest.mark.django_db
def test_replacing_meetup_image_via_model_save(convention: Convention, user):
    # 1. Create meetup with initial banner
    initial_file = _create_test_image("first_banner.webp", color="blue")
    meetup = Meetup.objects.create(
        convention=convention,
        created_by=user,
        name="Honkai Star Rail Gathering",
        starts_at=datetime(2027, 7, 2, 14, 0, tzinfo=UTC),
        ends_at=datetime(2027, 7, 2, 16, 0, tzinfo=UTC),
        image=initial_file,
    )
    old_key = meetup.image.name
    assert default_storage.exists(old_key)

    # 2. Direct model assignment and save (simulating Django admin edit)
    replacement_file = _create_test_image("second_banner.webp", color="purple")
    meetup.image = replacement_file
    meetup.save()

    new_key = meetup.image.name
    assert new_key != old_key
    assert not default_storage.exists(
        old_key
    ), "Old banner should be deleted upon direct model save"
    assert default_storage.exists(new_key)

    # Cleanup
    if default_storage.exists(new_key):
        default_storage.delete(new_key)


@pytest.mark.django_db
def test_clearing_meetup_image_deletes_image_from_storage(convention: Convention, user):
    initial_file = _create_test_image("banner_to_clear.webp", color="yellow")
    meetup = Meetup.objects.create(
        convention=convention,
        created_by=user,
        name="VTuber Fan Meetup",
        starts_at=datetime(2027, 7, 2, 10, 0, tzinfo=UTC),
        ends_at=datetime(2027, 7, 2, 11, 0, tzinfo=UTC),
        image=initial_file,
    )
    storage_key = meetup.image.name
    assert default_storage.exists(storage_key)

    serializer = MeetupUpdateSerializer(
        instance=meetup,
        data={"clear_image": True},
        partial=True,
    )
    assert serializer.is_valid(), serializer.errors
    cleared_meetup = serializer.save()

    assert not cleared_meetup.image
    assert not default_storage.exists(
        storage_key
    ), "Cleared meetup image should be deleted from storage"


@pytest.mark.django_db
def test_updating_non_image_fields_does_not_delete_banner(convention: Convention, user):
    initial_file = _create_test_image("stable_banner.webp", color="orange")
    meetup = Meetup.objects.create(
        convention=convention,
        created_by=user,
        name="Artists Gathering",
        starts_at=datetime(2027, 7, 2, 15, 0, tzinfo=UTC),
        ends_at=datetime(2027, 7, 2, 17, 0, tzinfo=UTC),
        image=initial_file,
    )
    storage_key = meetup.image.name
    assert default_storage.exists(storage_key)

    serializer = MeetupUpdateSerializer(
        instance=meetup,
        data={"name": "Renamed Artists Gathering", "location": "Room 402"},
        partial=True,
    )
    assert serializer.is_valid(), serializer.errors
    updated = serializer.save()

    assert updated.name == "Renamed Artists Gathering"
    assert default_storage.exists(
        storage_key
    ), "Existing banner must not be deleted when updating text fields"

    # Cleanup
    if default_storage.exists(storage_key):
        default_storage.delete(storage_key)


@pytest.mark.django_db
def test_deleting_meetup_model_deletes_banner_from_storage(convention: Convention, user):
    initial_file = _create_test_image("delete_with_meetup.webp", color="cyan")
    meetup = Meetup.objects.create(
        convention=convention,
        created_by=user,
        name="Ephemeral Meetup",
        starts_at=datetime(2027, 7, 2, 18, 0, tzinfo=UTC),
        ends_at=datetime(2027, 7, 2, 19, 0, tzinfo=UTC),
        image=initial_file,
    )
    storage_key = meetup.image.name
    assert default_storage.exists(storage_key)

    meetup.delete()
    assert not default_storage.exists(
        storage_key
    ), "Banner image should be deleted from storage when meetup is deleted"


@pytest.mark.django_db
def test_meetup_image_replacement_purges_imagekit_cache(convention: Convention, user):
    initial_file = _create_test_image("cached_banner.webp", color="pink")
    meetup = Meetup.objects.create(
        convention=convention,
        created_by=user,
        name="Cache Purge Test Meetup",
        starts_at=datetime(2027, 7, 2, 9, 0, tzinfo=UTC),
        ends_at=datetime(2027, 7, 2, 10, 0, tzinfo=UTC),
        image=initial_file,
    )
    old_key = meetup.image.name
    path_without_ext = old_key.rsplit(".", 1)[0]
    expected_cache_prefix = f"CACHE/images/{path_without_ext}"

    mock_bucket = MagicMock()
    mock_filter = MagicMock()
    mock_bucket.objects.filter.return_value = mock_filter

    mock_storage = MagicMock(wraps=default_storage)
    mock_storage.bucket = mock_bucket

    with patch("config.storage.default_storage", mock_storage):
        replacement_file = _create_test_image("new_cached_banner.webp", color="black")
        meetup.image = replacement_file
        meetup.save()

    mock_bucket.objects.filter.assert_called_with(Prefix=expected_cache_prefix)
    mock_filter.delete.assert_called_once()

    # Cleanup
    if default_storage.exists(meetup.image.name):
        default_storage.delete(meetup.image.name)


@pytest.mark.django_db
def test_replacing_and_deleting_meetup_photo_cleans_up_storage(
    convention: Convention, user
):
    meetup = Meetup.objects.create(
        convention=convention,
        created_by=user,
        name="Album Meetup",
        starts_at=datetime(2027, 7, 2, 9, 0, tzinfo=UTC),
        ends_at=datetime(2027, 7, 2, 10, 0, tzinfo=UTC),
    )
    album = MeetupAlbum.objects.create(
        meetup=meetup,
        created_by=user,
        title="Day 1 Photos",
    )
    photo_file = _create_test_image("photo1.webp", color="red")
    photo = MeetupPhoto.objects.create(
        album=album,
        image=photo_file,
    )
    old_photo_key = photo.image.name
    assert default_storage.exists(old_photo_key)

    # 1. Replace photo image
    new_photo_file = _create_test_image("photo2.webp", color="green")
    photo.image = new_photo_file
    photo.save()

    new_photo_key = photo.image.name
    assert new_photo_key != old_photo_key
    assert not default_storage.exists(
        old_photo_key
    ), "Old photo should be deleted on replacement"
    assert default_storage.exists(new_photo_key)

    # 2. Delete photo model
    photo.delete()
    assert not default_storage.exists(
        new_photo_key
    ), "Photo image should be deleted from storage on model delete"
