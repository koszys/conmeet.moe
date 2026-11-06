from datetime import datetime, timezone
from io import BytesIO

import pytest
from conventions.models import Convention
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework import status
from rest_framework.test import APIClient

from meetups.models import Meetup

pytestmark = pytest.mark.django_db
User = get_user_model()


def _create_test_image_file(name: str = "banner.webp") -> SimpleUploadedFile:
    img = Image.new("RGB", (200, 200), color="purple")
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


def test_regular_user_can_create_official_or_fan_meetup(
    convention: Convention, regular_user: User
) -> None:
    client = APIClient()
    client.force_authenticate(user=regular_user)

    payload = {
        "name": "Official Cosplay Gathering",
        "location": "North Plaza",
        "starts_at": "2027-07-02T13:00:00Z",
        "ends_at": "2027-07-02T15:00:00Z",
        "description": "Come join our group cosplay photo!",
        "is_official": True,
    }
    resp = client.post(f"/api/v1/conventions/{convention.slug}/meetups/", payload)
    assert resp.status_code == status.HTTP_201_CREATED
    data = resp.json()
    assert data["name"] == "Official Cosplay Gathering"
    assert data["is_official"] is True


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


def test_save_and_going_require_authentication(convention: Convention) -> None:
    meetup = Meetup.objects.create(
        convention=convention,
        name="Saved Meetup Test",
        starts_at=datetime(2027, 7, 2, 12, 0, tzinfo=timezone.utc),
        ends_at=datetime(2027, 7, 2, 14, 0, tzinfo=timezone.utc),
    )
    client = APIClient()

    resp_save = client.post(f"/api/v1/meetups/{meetup.id}/save/")
    assert resp_save.status_code == status.HTTP_401_UNAUTHORIZED

    resp_going = client.post(f"/api/v1/meetups/{meetup.id}/going/")
    assert resp_going.status_code == status.HTTP_401_UNAUTHORIZED


def test_toggle_save_meetup(convention: Convention, regular_user: User) -> None:
    meetup = Meetup.objects.create(
        convention=convention,
        name="Save Toggle Meetup",
        starts_at=datetime(2027, 7, 2, 12, 0, tzinfo=timezone.utc),
        ends_at=datetime(2027, 7, 2, 14, 0, tzinfo=timezone.utc),
    )
    client = APIClient()
    client.force_authenticate(user=regular_user)

    # First toggle: Save
    resp = client.post(f"/api/v1/meetups/{meetup.id}/save/")
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["is_saved"] is True
    assert resp.json()["save_count"] == 1

    # In list endpoint, is_saved is True
    resp_list = client.get(f"/api/v1/conventions/{convention.slug}/meetups/")
    assert resp_list.json()[0]["is_saved"] is True
    assert resp_list.json()[0]["save_count"] == 1

    # Second toggle: Unsave
    resp2 = client.post(f"/api/v1/meetups/{meetup.id}/save/")
    assert resp2.status_code == status.HTTP_200_OK
    assert resp2.json()["is_saved"] is False
    assert resp2.json()["save_count"] == 0


def test_toggle_going_meetup(convention: Convention, regular_user: User) -> None:
    meetup = Meetup.objects.create(
        convention=convention,
        name="RSVP Meetup",
        starts_at=datetime(2027, 7, 2, 12, 0, tzinfo=timezone.utc),
        ends_at=datetime(2027, 7, 2, 14, 0, tzinfo=timezone.utc),
    )
    client = APIClient()
    client.force_authenticate(user=regular_user)

    # First toggle: Going
    resp = client.post(f"/api/v1/meetups/{meetup.id}/going/")
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["is_going"] is True
    assert resp.json()["going_count"] == 1

    # In list endpoint, is_going is True
    resp_list = client.get(f"/api/v1/conventions/{convention.slug}/meetups/")
    assert resp_list.json()[0]["is_going"] is True
    assert resp_list.json()[0]["going_count"] == 1

    # Second toggle: Not going
    resp2 = client.post(f"/api/v1/meetups/{meetup.id}/going/")
    assert resp2.status_code == status.HTTP_200_OK
    assert resp2.json()["is_going"] is False
    assert resp2.json()["going_count"] == 0


def test_filter_saved_meetups(convention: Convention, regular_user: User) -> None:
    m1 = Meetup.objects.create(
        convention=convention,
        name="Saved Meetup",
        starts_at=datetime(2027, 7, 2, 12, 0, tzinfo=timezone.utc),
        ends_at=datetime(2027, 7, 2, 14, 0, tzinfo=timezone.utc),
    )
    m2 = Meetup.objects.create(
        convention=convention,
        name="Unsaved Meetup",
        starts_at=datetime(2027, 7, 2, 15, 0, tzinfo=timezone.utc),
        ends_at=datetime(2027, 7, 2, 17, 0, tzinfo=timezone.utc),
    )

    client = APIClient()
    client.force_authenticate(user=regular_user)

    # Save m1
    client.post(f"/api/v1/meetups/{m1.id}/save/")

    # Query with ?saved=true
    resp = client.get(f"/api/v1/conventions/{convention.slug}/meetups/?saved=true")
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert len(data) == 1
    assert data[0]["id"] == m1.id


def test_create_meetup_with_image_upload(convention: Convention, regular_user: User) -> None:
    client = APIClient()
    client.force_authenticate(user=regular_user)

    image_file = _create_test_image_file("poster.webp")
    payload = {
        "name": "Cosplay Showcase",
        "location": "Main Stage",
        "starts_at": "2027-07-02T13:00:00Z",
        "ends_at": "2027-07-02T15:00:00Z",
        "description": "Show off your craftsmanship!",
        "image": image_file,
    }
    resp = client.post(
        f"/api/v1/conventions/{convention.slug}/meetups/",
        payload,
        format="multipart",
    )
    assert resp.status_code == status.HTTP_201_CREATED
    data = resp.json()
    assert data["name"] == "Cosplay Showcase"
    assert "poster" in data["image"]
    assert data["image_thumb"] is not None


def test_update_meetup_clear_image(convention: Convention, regular_user: User) -> None:
    image_file = _create_test_image_file("initial.webp")
    meetup = Meetup.objects.create(
        convention=convention,
        name="Meetup with banner",
        starts_at=datetime(2027, 7, 2, 12, 0, tzinfo=timezone.utc),
        ends_at=datetime(2027, 7, 2, 14, 0, tzinfo=timezone.utc),
        created_by=regular_user,
        image=image_file,
    )
    assert bool(meetup.image) is True

    client = APIClient()
    client.force_authenticate(user=regular_user)
    resp = client.patch(f"/api/v1/meetups/{meetup.id}/", {"clear_image": True})
    assert resp.status_code == status.HTTP_200_OK
    meetup.refresh_from_db()
    assert bool(meetup.image) is False


def test_staff_can_edit_and_delete_any_meetup(
    convention: Convention, regular_user: User, staff_user: User
) -> None:
    meetup = Meetup.objects.create(
        convention=convention,
        name="User Community Meetup",
        starts_at=datetime(2027, 7, 2, 12, 0, tzinfo=timezone.utc),
        ends_at=datetime(2027, 7, 2, 14, 0, tzinfo=timezone.utc),
        created_by=regular_user,
        is_official=False,
    )

    client = APIClient()
    client.force_authenticate(user=staff_user)

    # Staff promotes to official
    resp_patch = client.patch(
        f"/api/v1/meetups/{meetup.id}/",
        {"is_official": True, "name": "Promoted Official Meetup"},
    )
    assert resp_patch.status_code == status.HTTP_200_OK
    assert resp_patch.json()["is_official"] is True
    assert resp_patch.json()["name"] == "Promoted Official Meetup"

    # Staff deletes user meetup
    resp_del = client.delete(f"/api/v1/meetups/{meetup.id}/")
    assert resp_del.status_code == status.HTTP_204_NO_CONTENT
    assert not Meetup.objects.filter(id=meetup.id).exists()


def test_save_and_going_multi_user_isolation(
    convention: Convention, regular_user: User, other_user: User
) -> None:
    meetup = Meetup.objects.create(
        convention=convention,
        name="Multi-user Gathering",
        starts_at=datetime(2027, 7, 2, 12, 0, tzinfo=timezone.utc),
        ends_at=datetime(2027, 7, 2, 14, 0, tzinfo=timezone.utc),
    )

    client1 = APIClient()
    client1.force_authenticate(user=regular_user)

    client2 = APIClient()
    client2.force_authenticate(user=other_user)

    # User 1 saves and marks going
    client1.post(f"/api/v1/meetups/{meetup.id}/save/")
    client1.post(f"/api/v1/meetups/{meetup.id}/going/")

    # User 2 saves only
    client2.post(f"/api/v1/meetups/{meetup.id}/save/")

    # Check from user 1's view
    resp1 = client1.get(f"/api/v1/conventions/{convention.slug}/meetups/")
    data1 = resp1.json()[0]
    assert data1["save_count"] == 2
    assert data1["going_count"] == 1
    assert data1["is_saved"] is True
    assert data1["is_going"] is True

    # Check from user 2's view
    resp2 = client2.get(f"/api/v1/conventions/{convention.slug}/meetups/")
    data2 = resp2.json()[0]
    assert data2["save_count"] == 2
    assert data2["going_count"] == 1
    assert data2["is_saved"] is True
    assert data2["is_going"] is False


def test_meetup_not_found_endpoints() -> None:
    client = APIClient()
    resp_detail = client.get("/api/v1/meetups/99999/")
    assert resp_detail.status_code == status.HTTP_404_NOT_FOUND

    user = User.objects.create_user(username="temp", email="temp@example.com", password="pw")
    client.force_authenticate(user=user)

    resp_save = client.post("/api/v1/meetups/99999/save/")
    assert resp_save.status_code == status.HTTP_404_NOT_FOUND

    resp_going = client.post("/api/v1/meetups/99999/going/")
    assert resp_going.status_code == status.HTTP_404_NOT_FOUND


def test_convention_slug_not_found() -> None:
    client = APIClient()
    resp = client.get("/api/v1/conventions/non-existent-convention/meetups/")
    assert resp.status_code == status.HTTP_404_NOT_FOUND


