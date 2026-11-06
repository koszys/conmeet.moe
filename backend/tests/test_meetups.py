from datetime import datetime, timezone
import pytest
from conventions.models import Convention
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from meetups.models import Meetup

pytestmark = pytest.mark.django_db
User = get_user_model()


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
def regular_user() -> User:
    return User.objects.create_user(
        username="cosplayer1", email="cosplay@example.com", password="password123"
    )


@pytest.fixture
def staff_user() -> User:
    return User.objects.create_user(
        username="staffadmin",
        email="staff@example.com",
        password="password123",
        is_staff=True,
    )


@pytest.fixture
def other_user() -> User:
    return User.objects.create_user(
        username="randomguy", email="random@example.com", password="password123"
    )


def test_list_convention_meetups_unauthenticated(convention: Convention, regular_user: User) -> None:
    Meetup.objects.create(
        convention=convention,
        name="Genshin Impact Gathering",
        location="South Hall Lobby",
        starts_at=datetime(2027, 7, 2, 14, 0, tzinfo=timezone.utc),
        ends_at=datetime(2027, 7, 2, 16, 0, tzinfo=timezone.utc),
        created_by=regular_user,
    )

    client = APIClient()
    resp = client.get(f"/api/v1/conventions/{convention.slug}/meetups/")
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert len(data) == 1
    assert data[0]["name"] == "Genshin Impact Gathering"
    assert data[0]["convention_slug"] == convention.slug
    assert data[0]["is_saved"] is False
    assert data[0]["is_going"] is False
    assert data[0]["going_count"] == 0


def test_filter_meetups_by_date_official_and_search(convention: Convention, regular_user: User) -> None:
    m1 = Meetup.objects.create(
        convention=convention,
        name="Official Guest Autographs",
        location="Room 403",
        starts_at=datetime(2027, 7, 2, 10, 0, tzinfo=timezone.utc),
        ends_at=datetime(2027, 7, 2, 12, 0, tzinfo=timezone.utc),
        is_official=True,
    )
    m2 = Meetup.objects.create(
        convention=convention,
        name="Frieren Fan Photoshoot",
        location="Fountain Stairs",
        starts_at=datetime(2027, 7, 3, 15, 0, tzinfo=timezone.utc),
        ends_at=datetime(2027, 7, 3, 17, 0, tzinfo=timezone.utc),
        is_official=False,
    )

    client = APIClient()

    # Filter official
    resp_official = client.get(f"/api/v1/conventions/{convention.slug}/meetups/?official=true")
    assert resp_official.status_code == status.HTTP_200_OK
    assert len(resp_official.json()) == 1
    assert resp_official.json()[0]["id"] == m1.id

    # Filter date
    resp_date = client.get(f"/api/v1/conventions/{convention.slug}/meetups/?date=2027-07-03")
    assert resp_date.status_code == status.HTTP_200_OK
    assert len(resp_date.json()) == 1
    assert resp_date.json()[0]["id"] == m2.id

    # Search query
    resp_search = client.get(f"/api/v1/conventions/{convention.slug}/meetups/?q=Frieren")
    assert resp_search.status_code == status.HTTP_200_OK
    assert len(resp_search.json()) == 1
    assert resp_search.json()[0]["id"] == m2.id


def test_create_meetup_requires_authentication(convention: Convention) -> None:
    client = APIClient()
    payload = {
        "name": "Unauthorized Meetup",
        "starts_at": "2027-07-02T12:00:00Z",
        "ends_at": "2027-07-02T14:00:00Z",
    }
    resp = client.post(f"/api/v1/conventions/{convention.slug}/meetups/", payload)
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED


def test_regular_user_cannot_create_official_meetup(convention: Convention, regular_user: User) -> None:
    client = APIClient()
    client.force_authenticate(user=regular_user)

    payload = {
        "name": "Community Cosplay Group",
        "location": "North Plaza",
        "starts_at": "2027-07-02T13:00:00Z",
        "ends_at": "2027-07-02T15:00:00Z",
        "description": "Come join our group cosplay photo!",
        "is_official": True,  # Non-staff attempting official
    }
    resp = client.post(f"/api/v1/conventions/{convention.slug}/meetups/", payload)
    assert resp.status_code == status.HTTP_201_CREATED
    data = resp.json()
    assert data["name"] == "Community Cosplay Group"
    assert data["is_official"] is False  # Forced to False by serializer


def test_staff_user_can_create_official_meetup(convention: Convention, staff_user: User) -> None:
    client = APIClient()
    client.force_authenticate(user=staff_user)

    payload = {
        "name": "Official Opening Ceremony",
        "location": "Main Stage",
        "starts_at": "2027-07-01T09:00:00Z",
        "ends_at": "2027-07-01T11:00:00Z",
        "description": "Opening remarks and kickoff",
        "is_official": True,
    }
    resp = client.post(f"/api/v1/conventions/{convention.slug}/meetups/", payload)
    assert resp.status_code == status.HTTP_201_CREATED
    assert resp.json()["is_official"] is True


def test_create_meetup_invalid_dates(convention: Convention, regular_user: User) -> None:
    client = APIClient()
    client.force_authenticate(user=regular_user)

    payload = {
        "name": "Time Travel Meetup",
        "starts_at": "2027-07-02T15:00:00Z",
        "ends_at": "2027-07-02T13:00:00Z",  # ends before starts
    }
    resp = client.post(f"/api/v1/conventions/{convention.slug}/meetups/", payload)
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "ends_at" in resp.json()


def test_retrieve_meetup_detail(convention: Convention, regular_user: User) -> None:
    meetup = Meetup.objects.create(
        convention=convention,
        name="Hatsune Miku Fan Meet",
        location="Exhibit Hall A",
        starts_at=datetime(2027, 7, 2, 16, 0, tzinfo=timezone.utc),
        ends_at=datetime(2027, 7, 2, 18, 0, tzinfo=timezone.utc),
        created_by=regular_user,
    )
    meetup.description = '{"delta": "", "html": "<p>Bring glowsticks!</p>"}'
    meetup.save()

    client = APIClient()
    resp = client.get(f"/api/v1/meetups/{meetup.id}/")
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert data["name"] == "Hatsune Miku Fan Meet"
    assert "<p>Bring glowsticks!</p>" in data["description"]
    assert data["created_by_name"] == regular_user.username


def test_update_meetup_author_and_permissions(
    convention: Convention, regular_user: User, other_user: User
) -> None:
    meetup = Meetup.objects.create(
        convention=convention,
        name="Original Meetup Name",
        starts_at=datetime(2027, 7, 2, 12, 0, tzinfo=timezone.utc),
        ends_at=datetime(2027, 7, 2, 14, 0, tzinfo=timezone.utc),
        created_by=regular_user,
    )

    client = APIClient()

    # Non-author tries to edit -> 403 Forbidden
    client.force_authenticate(user=other_user)
    resp = client.patch(f"/api/v1/meetups/{meetup.id}/", {"name": "Hacked Meetup"})
    assert resp.status_code == status.HTTP_403_FORBIDDEN

    # Author edits -> 200 OK
    client.force_authenticate(user=regular_user)
    resp = client.patch(f"/api/v1/meetups/{meetup.id}/", {"name": "Updated Meetup Name"})
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["name"] == "Updated Meetup Name"


def test_delete_meetup_author_and_permissions(
    convention: Convention, regular_user: User, other_user: User
) -> None:
    meetup = Meetup.objects.create(
        convention=convention,
        name="Meetup To Delete",
        starts_at=datetime(2027, 7, 2, 12, 0, tzinfo=timezone.utc),
        ends_at=datetime(2027, 7, 2, 14, 0, tzinfo=timezone.utc),
        created_by=regular_user,
    )

    client = APIClient()

    # Non-author cannot delete
    client.force_authenticate(user=other_user)
    resp = client.delete(f"/api/v1/meetups/{meetup.id}/")
    assert resp.status_code == status.HTTP_403_FORBIDDEN

    # Author can delete
    client.force_authenticate(user=regular_user)
    resp = client.delete(f"/api/v1/meetups/{meetup.id}/")
    assert resp.status_code == status.HTTP_204_NO_CONTENT
    assert not Meetup.objects.filter(id=meetup.id).exists()
