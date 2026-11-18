import datetime

import pytest
from conventions.models import Convention
from django.contrib.auth import get_user_model
from django.utils import timezone
from meetups.models import Meetup, meetup_banner_upload_path
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def test_convention(db) -> Convention:
    return Convention.objects.create(
        name="Anime Expo 2026",
        slug="anime-expo-2026",
        starts_at=timezone.now().date(),
        ends_at=(timezone.now() + datetime.timedelta(days=3)).date(),
    )


@pytest.fixture
def auth_user(db):
    return User.objects.create_user(
        username="slugtester",
        email="slugtester@example.com",
        password="password123",
    )


@pytest.fixture
def auth_client(auth_user) -> APIClient:
    client = APIClient()
    client.force_authenticate(user=auth_user)
    return client


@pytest.mark.django_db
def test_meetup_slug_auto_generation(test_convention: Convention, auth_user):
    """Test that a meetup automatically gets a slug based on its name."""
    now = timezone.now()
    meetup = Meetup.objects.create(
        convention=test_convention,
        name="Honkai Star Rail Cosplay Gathering",
        starts_at=now,
        ends_at=now + datetime.timedelta(hours=2),
        created_by=auth_user,
    )
    assert meetup.slug == "honkai-star-rail-cosplay-gathering"


@pytest.mark.django_db
def test_meetup_slug_collision_handling(test_convention: Convention, auth_user):
    """Test that duplicate meetup names in the same convention append -2, -3."""
    now = timezone.now()
    m1 = Meetup.objects.create(
        convention=test_convention,
        name="Fate Grand Order Meetup",
        starts_at=now,
        ends_at=now + datetime.timedelta(hours=1),
        created_by=auth_user,
    )
    m2 = Meetup.objects.create(
        convention=test_convention,
        name="Fate Grand Order Meetup",
        starts_at=now + datetime.timedelta(days=1),
        ends_at=now + datetime.timedelta(days=1, hours=1),
        created_by=auth_user,
    )
    m3 = Meetup.objects.create(
        convention=test_convention,
        name="Fate Grand Order Meetup",
        starts_at=now + datetime.timedelta(days=2),
        ends_at=now + datetime.timedelta(days=2, hours=1),
        created_by=auth_user,
    )

    assert m1.slug == "fate-grand-order-meetup"
    assert m2.slug == "fate-grand-order-meetup-2"
    assert m3.slug == "fate-grand-order-meetup-3"


@pytest.mark.django_db
def test_dual_lookup_by_slug_and_id(auth_client: APIClient, test_convention: Convention, auth_user):
    """Test that meetups can be queried via API by either their numeric ID or slug."""
    now = timezone.now()
    meetup = Meetup.objects.create(
        convention=test_convention,
        name="Chainsaw Man Fans",
        starts_at=now,
        ends_at=now + datetime.timedelta(hours=2),
        created_by=auth_user,
    )
    slug = meetup.slug
    pk = meetup.id

    # Lookup by numeric ID
    res_id = auth_client.get(f"/api/v1/meetups/{pk}/")
    assert res_id.status_code == status.HTTP_200_OK
    assert res_id.data["id"] == pk
    assert res_id.data["slug"] == slug

    # Lookup by slug
    res_slug = auth_client.get(f"/api/v1/meetups/{slug}/")
    assert res_slug.status_code == status.HTTP_200_OK
    assert res_slug.data["id"] == pk
    assert res_slug.data["slug"] == slug

    # Toggle going by slug
    res_going = auth_client.post(f"/api/v1/meetups/{slug}/going/")
    assert res_going.status_code == status.HTTP_200_OK
    assert res_going.data["is_going"] is True

    # Toggle save by slug
    res_save = auth_client.post(f"/api/v1/meetups/{slug}/save/")
    assert res_save.status_code == status.HTTP_200_OK
    assert res_save.data["is_saved"] is True

    # Albums list by slug
    res_albums = auth_client.get(f"/api/v1/meetups/{slug}/albums/")
    assert res_albums.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_meetup_banner_upload_path_formatting(test_convention: Convention, auth_user):
    """Test that banner upload path follows meetups/{slug}/banner_{hash}.webp."""
    now = timezone.now()
    meetup = Meetup.objects.create(
        convention=test_convention,
        name="Evangelion Meetup",
        starts_at=now,
        ends_at=now + datetime.timedelta(hours=2),
        created_by=auth_user,
    )
    path = meetup_banner_upload_path(meetup, "banner.png")
    assert path.startswith("meetups/evangelion-meetup/banner_")
    assert path.endswith(".png")
