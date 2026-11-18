from io import BytesIO

import pytest
from conventions.models import Convention
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from meetups.models import AlbumFavorite, AlbumLike, Meetup, MeetupAlbum, MeetupPhoto, PhotoLike
from PIL import Image
from rest_framework import status
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db
User = get_user_model()


def _create_test_image_file(name: str = "photo.webp") -> SimpleUploadedFile:
    img = Image.new("RGB", (300, 300), color="blue")
    buf = BytesIO()
    img.save(buf, format="WEBP")
    return SimpleUploadedFile(name, buf.getvalue(), content_type="image/webp")


@pytest.fixture
def convention() -> Convention:
    return Convention.objects.create(
        name="Anime Expo 2027",
        slug="anime-expo-2027",
        venue_name="LA Convention Center",
        city="Los Angeles",
        country="USA",
        starts_at="2027-07-01",
        ends_at="2027-07-04",
    )


@pytest.fixture
def meetup(convention: Convention, regular_user: User) -> Meetup:
    return Meetup.objects.create(
        convention=convention,
        created_by=regular_user,
        name="Genshin Cosplay Gathering",
        location="South Hall Plaza",
        starts_at="2027-07-02T13:00:00Z",
        ends_at="2027-07-02T15:00:00Z",
    )


@pytest.fixture
def regular_user() -> User:
    return User.objects.create_user(
        username="cosplayer1", email="cosplay@example.com", password="password123"
    )


@pytest.fixture
def other_user() -> User:
    return User.objects.create_user(
        username="otheruser", email="other@example.com", password="password123"
    )


@pytest.fixture
def staff_user() -> User:
    return User.objects.create_user(
        username="adminstaff", email="admin@example.com", password="password123", is_staff=True
    )


@pytest.fixture
def auth_client(regular_user: User) -> APIClient:
    client = APIClient()
    client.force_authenticate(user=regular_user)
    return client


@pytest.fixture
def other_client(other_user: User) -> APIClient:
    client = APIClient()
    client.force_authenticate(user=other_user)
    return client


def test_list_albums_empty(meetup: Meetup):
    client = APIClient()
    url = f"/api/v1/meetups/{meetup.id}/albums/"
    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK
    assert res.data == []


def test_create_album_requires_auth(meetup: Meetup):
    client = APIClient()
    url = f"/api/v1/meetups/{meetup.id}/albums/"
    res = client.post(url, {"title": "My Photos"})
    assert res.status_code == status.HTTP_401_UNAUTHORIZED


def test_create_album_with_photos_and_socials(auth_client: APIClient, meetup: Meetup):
    url = f"/api/v1/meetups/{meetup.id}/albums/"
    data = {
        "title": "Genshin Photoshoot Day 2",
        "description": "Photos from the fountain gathering! Feel free to tag yourselves.",
        "social_links": '{"instagram": "cosplay_lens", "twitter": "cos_lens", "website": "https://portfolio.me"}',
        "photos": [_create_test_image_file("img1.webp"), _create_test_image_file("img2.webp")],
    }
    res = auth_client.post(url, data, format="multipart")
    assert res.status_code == status.HTTP_201_CREATED
    assert res.data["title"] == "Genshin Photoshoot Day 2"
    assert res.data["social_links"]["instagram"] == "cosplay_lens"

    album = MeetupAlbum.objects.get(id=res.data["id"])
    assert album.photos_count == 2
    assert album.cover_photo is not None
    assert album.photos.count() == 2


def test_album_detail_and_photos(auth_client: APIClient, meetup: Meetup, regular_user: User):
    album = MeetupAlbum.objects.create(
        meetup=meetup,
        created_by=regular_user,
        title="Hall Shots",
        social_links={"instagram": "hall_shots"},
    )
    p1 = MeetupPhoto.objects.create(album=album, image=_create_test_image_file("p1.webp"), order=0)
    p2 = MeetupPhoto.objects.create(album=album, image=_create_test_image_file("p2.webp"), order=1)
    album.photos_count = 2
    album.cover_photo = p1
    album.save()

    url = f"/api/v1/albums/{album.id}/"
    res = auth_client.get(url)
    assert res.status_code == status.HTTP_200_OK
    assert res.data["title"] == "Hall Shots"
    assert res.data["is_owner"] is True
    assert len(res.data["photos"]) == 2
    assert res.data["photos"][0]["id"] == p1.id
    assert res.data["photos"][1]["id"] == p2.id


def test_album_like_toggle(auth_client: APIClient, meetup: Meetup, regular_user: User):
    album = MeetupAlbum.objects.create(meetup=meetup, created_by=regular_user, title="Like Test")
    url = f"/api/v1/albums/{album.id}/like/"

    # First like
    res = auth_client.post(url)
    assert res.status_code == status.HTTP_200_OK
    assert res.data["is_liked"] is True
    assert res.data["likes_count"] == 1
    assert AlbumLike.objects.filter(user=regular_user, album=album).exists()

    # Unlike
    res = auth_client.post(url)
    assert res.status_code == status.HTTP_200_OK
    assert res.data["is_liked"] is False
    assert res.data["likes_count"] == 0
    assert not AlbumLike.objects.filter(user=regular_user, album=album).exists()


def test_album_favorite_toggle(auth_client: APIClient, meetup: Meetup, regular_user: User):
    album = MeetupAlbum.objects.create(meetup=meetup, created_by=regular_user, title="Fav Test")
    url = f"/api/v1/albums/{album.id}/favorite/"

    # First favorite
    res = auth_client.post(url)
    assert res.status_code == status.HTTP_200_OK
    assert res.data["is_favorited"] is True
    assert res.data["favorites_count"] == 1
    assert AlbumFavorite.objects.filter(user=regular_user, album=album).exists()

    # Unfavorite
    res = auth_client.post(url)
    assert res.status_code == status.HTTP_200_OK
    assert res.data["is_favorited"] is False
    assert res.data["favorites_count"] == 0
    assert not AlbumFavorite.objects.filter(user=regular_user, album=album).exists()


def test_photo_like_toggle(auth_client: APIClient, meetup: Meetup, regular_user: User):
    album = MeetupAlbum.objects.create(meetup=meetup, created_by=regular_user, title="Photo Like")
    photo = MeetupPhoto.objects.create(
        album=album, image=_create_test_image_file("pic.webp"), order=0
    )
    url = f"/api/v1/photos/{photo.id}/like/"

    # Like photo
    res = auth_client.post(url)
    assert res.status_code == status.HTTP_200_OK
    assert res.data["is_liked"] is True
    assert res.data["likes_count"] == 1
    assert PhotoLike.objects.filter(user=regular_user, photo=photo).exists()

    # Unlike photo
    res = auth_client.post(url)
    assert res.status_code == status.HTTP_200_OK
    assert res.data["is_liked"] is False
    assert res.data["likes_count"] == 0


def test_album_update_by_author(auth_client: APIClient, meetup: Meetup, regular_user: User):
    album = MeetupAlbum.objects.create(meetup=meetup, created_by=regular_user, title="Original")
    p1 = MeetupPhoto.objects.create(album=album, image=_create_test_image_file("p1.webp"), order=0)
    album.photos_count = 1
    album.cover_photo = p1
    album.save()

    url = f"/api/v1/albums/{album.id}/"
    update_data = {
        "title": "Updated Title",
        "delete_photo_ids": str(p1.id),
        "photos": [_create_test_image_file("new_photo.webp")],
    }
    res = auth_client.patch(url, update_data, format="multipart")
    assert res.status_code == status.HTTP_200_OK
    assert res.data["title"] == "Updated Title"

    album.refresh_from_db()
    assert album.title == "Updated Title"
    assert not MeetupPhoto.objects.filter(id=p1.id).exists()
    assert album.photos_count == 1
    assert album.photos.first() is not None


def test_album_update_delete_all_photos_fails(
    auth_client: APIClient, meetup: Meetup, regular_user: User
):
    album = MeetupAlbum.objects.create(meetup=meetup, created_by=regular_user, title="Original")
    p1 = MeetupPhoto.objects.create(album=album, image=_create_test_image_file("p1.webp"), order=0)
    album.photos_count = 1
    album.cover_photo = p1
    album.save()

    url = f"/api/v1/albums/{album.id}/"
    update_data = {
        "delete_photo_ids": str(p1.id),
    }
    res = auth_client.patch(url, update_data, format="multipart")
    assert res.status_code == status.HTTP_400_BAD_REQUEST
    assert "photos" in res.data

    # Verify rollback
    album.refresh_from_db()
    assert MeetupPhoto.objects.filter(id=p1.id).exists()
    assert album.photos_count == 1


def test_album_update_by_non_author_forbidden(
    other_client: APIClient, meetup: Meetup, regular_user: User
):
    album = MeetupAlbum.objects.create(meetup=meetup, created_by=regular_user, title="Original")
    url = f"/api/v1/albums/{album.id}/"
    res = other_client.patch(url, {"title": "Hacked Title"})
    assert res.status_code == status.HTTP_403_FORBIDDEN


def test_album_delete_by_author(auth_client: APIClient, meetup: Meetup, regular_user: User):
    album = MeetupAlbum.objects.create(meetup=meetup, created_by=regular_user, title="To Delete")
    url = f"/api/v1/albums/{album.id}/"
    res = auth_client.delete(url)
    assert res.status_code == status.HTTP_204_NO_CONTENT
    assert not MeetupAlbum.objects.filter(id=album.id).exists()


def test_album_delete_by_non_author_forbidden(
    other_client: APIClient, meetup: Meetup, regular_user: User
):
    album = MeetupAlbum.objects.create(meetup=meetup, created_by=regular_user, title="Protected")
    url = f"/api/v1/albums/{album.id}/"
    res = other_client.delete(url)
    assert res.status_code == status.HTTP_403_FORBIDDEN
    assert MeetupAlbum.objects.filter(id=album.id).exists()


def test_album_sorting(meetup: Meetup, regular_user: User):
    client = APIClient()
    a1 = MeetupAlbum.objects.create(
        meetup=meetup, created_by=regular_user, title="Album A", likes_count=10, photos_count=5
    )
    a2 = MeetupAlbum.objects.create(
        meetup=meetup, created_by=regular_user, title="Album B", likes_count=50, photos_count=2
    )

    # Sort popular
    res = client.get(f"/api/v1/meetups/{meetup.id}/albums/?sort=popular")
    assert res.status_code == status.HTTP_200_OK
    assert res.data[0]["id"] == a2.id
    assert res.data[1]["id"] == a1.id

    # Sort photos
    res = client.get(f"/api/v1/meetups/{meetup.id}/albums/?sort=photos")
    assert res.status_code == status.HTTP_200_OK
    assert res.data[0]["id"] == a1.id
    assert res.data[1]["id"] == a2.id


def test_album_saved_filtering(meetup: Meetup, regular_user: User):
    client = APIClient()
    a1 = MeetupAlbum.objects.create(
        meetup=meetup, created_by=regular_user, title="Saved Album"
    )
    a2 = MeetupAlbum.objects.create(
        meetup=meetup, created_by=regular_user, title="Unsaved Album"
    )

    AlbumFavorite.objects.create(user=regular_user, album=a1)

    # Anonymous user gets empty list when requesting saved
    anon_res = client.get(f"/api/v1/meetups/{meetup.id}/albums/?sort=saved")
    assert anon_res.status_code == status.HTTP_200_OK
    assert len(anon_res.data) == 0

    # Authenticated user gets only saved albums
    client.force_authenticate(user=regular_user)
    auth_res = client.get(f"/api/v1/meetups/{meetup.id}/albums/?sort=saved")
    assert auth_res.status_code == status.HTTP_200_OK
    assert len(auth_res.data) == 1
    assert auth_res.data[0]["id"] == a1.id

    # Also test with saved=true query param
    param_res = client.get(f"/api/v1/meetups/{meetup.id}/albums/?saved=true")
    assert param_res.status_code == status.HTTP_200_OK
    assert len(param_res.data) == 1
    assert param_res.data[0]["id"] == a1.id


def test_meetup_photo_upload_path_and_cleanup(auth_client: APIClient, meetup: Meetup):
    """Verify that photo upload path follows meetups/{meetup_slug}/albums/{album_id}_{album_slug}/{order}_{uuid}.webp."""
    url = f"/api/v1/meetups/{meetup.id}/albums/"
    data = {
        "title": "Path Test Album",
        "photos": [_create_test_image_file("sample1.webp"), _create_test_image_file("sample2.webp")],
    }
    res = auth_client.post(url, data, format="multipart")
    assert res.status_code == status.HTTP_201_CREATED
    album_id = res.data["id"]

    photos = list(MeetupPhoto.objects.filter(album_id=album_id).order_by("order"))
    assert len(photos) == 2
    expected_prefix_0 = f"meetups/{meetup.slug}/albums/{album_id}_path-test-album/00_"
    expected_prefix_1 = f"meetups/{meetup.slug}/albums/{album_id}_path-test-album/01_"
    assert photos[0].image.name.startswith(expected_prefix_0)
    assert photos[0].image.name.endswith(".webp")
    assert photos[1].image.name.startswith(expected_prefix_1)

    # Delete album and verify deletion completes without error
    del_res = auth_client.delete(f"/api/v1/albums/{album_id}/")
    assert del_res.status_code == status.HTTP_204_NO_CONTENT
    assert not MeetupAlbum.objects.filter(id=album_id).exists()


