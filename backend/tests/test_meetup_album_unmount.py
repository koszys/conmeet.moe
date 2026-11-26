from datetime import UTC, datetime
from io import BytesIO

import pytest
from conventions.models import Convention
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from meetups.models import Meetup, MeetupAlbum, MeetupPhoto, MeetupSetting
from PIL import Image
from rest_framework import status
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db
User = get_user_model()


def _create_test_image(name: str = "test.webp") -> SimpleUploadedFile:
    img = Image.new("RGB", (100, 100), color="blue")
    buf = BytesIO()
    img.save(buf, format="WEBP")
    return SimpleUploadedFile(name, buf.getvalue(), content_type="image/webp")


@pytest.fixture
def convention() -> Convention:
    return Convention.objects.create(
        name="Anime Expo 2027",
        slug="anime-expo-2027",
        starts_at="2027-07-01",
        ends_at="2027-07-04",
    )


@pytest.fixture
def regular_user() -> User:
    return User.objects.create_user(
        username="attendee1", email="attendee@example.com", password="password123"
    )


@pytest.fixture
def staff_user() -> User:
    return User.objects.create_user(
        username="admin1", email="admin@example.com", password="password123", is_staff=True
    )


@pytest.fixture
def meetup(convention: Convention, regular_user: User) -> Meetup:
    return Meetup.objects.create(
        convention=convention,
        created_by=regular_user,
        name="Genshin Meetup",
        slug="genshin-meetup",
        starts_at=datetime(2027, 7, 1, 12, 0, tzinfo=UTC),
        ends_at=datetime(2027, 7, 1, 14, 0, tzinfo=UTC),
    )


@pytest.fixture
def auth_client(regular_user: User) -> APIClient:
    client = APIClient()
    client.force_authenticate(user=regular_user)
    return client


@pytest.fixture
def staff_client(staff_user: User) -> APIClient:
    client = APIClient()
    client.force_authenticate(user=staff_user)
    return client


def test_meetup_settings_endpoint():
    client = APIClient()
    resp = client.get("/api/v1/meetups/settings/")
    assert resp.status_code == status.HTTP_200_OK
    assert "unmount_all_albums" in resp.json()
    assert resp.json()["unmount_all_albums"] is False


def test_specific_album_unmount(
    auth_client: APIClient, staff_client: APIClient, meetup: Meetup, regular_user: User
):
    # Create two albums
    album_good = MeetupAlbum.objects.create(
        meetup=meetup, created_by=regular_user, title="Good Photos"
    )
    album_bad = MeetupAlbum.objects.create(
        meetup=meetup, created_by=regular_user, title="Abusive Album", unmount_album=True
    )

    # Public / regular client gets list: only good album is present
    resp = auth_client.get(f"/api/v1/meetups/{meetup.id}/albums/")
    assert resp.status_code == status.HTTP_200_OK
    titles = [a["title"] for a in resp.json()]
    assert "Good Photos" in titles
    assert "Abusive Album" not in titles

    # Direct fetch of bad album returns 404 for regular user
    bad_resp = auth_client.get(f"/api/v1/albums/{album_bad.id}/")
    assert bad_resp.status_code == status.HTTP_404_NOT_FOUND

    # Likes, favorites, and comments on bad album return 404
    assert (
        auth_client.post(f"/api/v1/albums/{album_bad.id}/like/").status_code
        == status.HTTP_404_NOT_FOUND
    )
    assert (
        auth_client.post(f"/api/v1/albums/{album_bad.id}/favorite/").status_code
        == status.HTTP_404_NOT_FOUND
    )
    assert (
        auth_client.get(f"/api/v1/albums/{album_bad.id}/comments/").status_code
        == status.HTTP_404_NOT_FOUND
    )

    # Staff user can still view the album
    staff_resp = staff_client.get(f"/api/v1/albums/{album_bad.id}/")
    assert staff_resp.status_code == status.HTTP_200_OK


def test_meetup_level_albums_unmount(
    auth_client: APIClient, convention: Convention, regular_user: User, meetup: Meetup
):
    other_meetup = Meetup.objects.create(
        convention=convention,
        created_by=regular_user,
        name="Other Meetup",
        slug="other-meetup",
        starts_at=datetime(2027, 7, 1, 15, 0, tzinfo=UTC),
        ends_at=datetime(2027, 7, 1, 16, 0, tzinfo=UTC),
    )
    MeetupAlbum.objects.create(meetup=meetup, created_by=regular_user, title="Meetup 1 Album")
    MeetupAlbum.objects.create(
        meetup=other_meetup, created_by=regular_user, title="Other Meetup Album"
    )

    # Unmount gallery for meetup 1
    meetup.unmount_albums = True
    meetup.save()

    # GET returns [] for unmounted meetup
    resp = auth_client.get(f"/api/v1/meetups/{meetup.id}/albums/")
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json() == []

    # POST returns 403 Forbidden
    photo = _create_test_image("img.webp")
    post_resp = auth_client.post(
        f"/api/v1/meetups/{meetup.id}/albums/",
        {"title": "Attempting Album", "photos": [photo]},
        format="multipart",
    )
    assert post_resp.status_code == status.HTTP_403_FORBIDDEN

    # Other meetup is unaffected
    other_resp = auth_client.get(f"/api/v1/meetups/{other_meetup.id}/albums/")
    assert other_resp.status_code == status.HTTP_200_OK
    assert len(other_resp.json()) == 1


def test_sitewide_albums_unmount(
    auth_client: APIClient, convention: Convention, regular_user: User, meetup: Meetup
):
    MeetupAlbum.objects.create(meetup=meetup, created_by=regular_user, title="Album")

    setting = MeetupSetting.get_settings()
    setting.unmount_all_albums = True
    setting.save()

    # GET returns []
    assert auth_client.get(f"/api/v1/meetups/{meetup.id}/albums/").json() == []

    # POST returns 403
    photo = _create_test_image("img2.webp")
    post_resp = auth_client.post(
        f"/api/v1/meetups/{meetup.id}/albums/",
        {"title": "New Album", "photos": [photo]},
        format="multipart",
    )
    assert post_resp.status_code == status.HTTP_403_FORBIDDEN
