import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from freebies.models import Freebie, UserFreebie, Vendor
from meetups.models import AlbumFavorite, Meetup, MeetupAlbum, SavedMeetup
from conventions.models import Convention

User = get_user_model()


@pytest.fixture
def regular_user(db) -> User:
    return User.objects.create_user(
        username="cosplayer1", email="cosplay@example.com", password="password123"
    )


@pytest.fixture
def auth_client(client, regular_user):
    from rest_framework_simplejwt.tokens import RefreshToken

    refresh = RefreshToken.for_user(regular_user)
    client.defaults["HTTP_AUTHORIZATION"] = f"Bearer {refresh.access_token}"
    return client


@pytest.fixture
def test_convention(db):
    now = timezone.now()
    return Convention.objects.create(
        name="Sync Con",
        slug="sync-con",
        starts_at=now,
        ends_at=now + timezone.timedelta(days=3),
    )


@pytest.fixture
def test_data(db, test_convention, regular_user):
    now = timezone.now()
    m1 = Meetup.objects.create(
        convention=test_convention,
        name="Meetup 1",
        starts_at=now,
        ends_at=now + timezone.timedelta(hours=2),
    )
    m2 = Meetup.objects.create(
        convention=test_convention,
        name="Meetup 2",
        starts_at=now,
        ends_at=now + timezone.timedelta(hours=2),
    )

    vendor = Vendor.objects.create(name="Vendor A")
    f1 = Freebie.objects.create(convention=test_convention, vendor=vendor, name="Freebie 1")
    f2 = Freebie.objects.create(convention=test_convention, vendor=vendor, name="Freebie 2")

    a1 = MeetupAlbum.objects.create(meetup=m1, title="Album 1", created_by=regular_user)
    a2 = MeetupAlbum.objects.create(meetup=m1, title="Album 2", created_by=regular_user)

    return {"m1": m1, "m2": m2, "f1": f1, "f2": f2, "a1": a1, "a2": a2}


@pytest.mark.django_db
def test_sync_saves_unauthenticated(client):
    res = client.post("/api/v1/auth/sync-saves/", {"meetup_ids": [1]}, content_type="application/json")
    assert res.status_code == 401


@pytest.mark.django_db
def test_sync_saves_success(auth_client, regular_user, test_data):
    m1 = test_data["m1"]
    f1 = test_data["f1"]
    a1 = test_data["a1"]

    payload = {
        "meetup_ids": [m1.id],
        "freebie_ids": [f1.id],
        "album_ids": [a1.id],
    }
    res = auth_client.post("/api/v1/auth/sync-saves/", payload, content_type="application/json")
    assert res.status_code == 200
    data = res.json()
    assert data["synced"] is True
    assert data["added_meetups"] == 1
    assert data["added_freebies"] == 1
    assert data["added_albums"] == 1

    assert SavedMeetup.objects.filter(user=regular_user, meetup=m1).exists()
    assert UserFreebie.objects.filter(user=regular_user, freebie=f1, claimed=False).exists()
    assert AlbumFavorite.objects.filter(user=regular_user, album=a1).exists()


@pytest.mark.django_db
def test_sync_saves_account_priority_and_idempotency(auth_client, regular_user, test_data):
    m1 = test_data["m1"]
    m2 = test_data["m2"]
    f1 = test_data["f1"]
    a1 = test_data["a1"]

    # Pre-save m1 on account
    SavedMeetup.objects.create(user=regular_user, meetup=m1)
    # Pre-claim f1 on account (claimed=True)
    UserFreebie.objects.create(user=regular_user, freebie=f1, claimed=True)

    # Guest payload saves m1 (overlapping) and m2 (new), f1 (already claimed), a1 (new)
    payload = {
        "meetup_ids": [m1.id, m2.id],
        "freebie_ids": [f1.id],
        "album_ids": [a1.id],
    }
    res = auth_client.post("/api/v1/auth/sync-saves/", payload, content_type="application/json")
    assert res.status_code == 200
    data = res.json()
    assert data["added_meetups"] == 1  # Only m2 is newly added!
    assert data["added_freebies"] == 0  # f1 was already on account
    assert data["added_albums"] == 1

    # Verify f1 claimed=True was NOT downgraded
    uf = UserFreebie.objects.get(user=regular_user, freebie=f1)
    assert uf.claimed is True

    # Verify both meetups are saved
    assert SavedMeetup.objects.filter(user=regular_user).count() == 2


@pytest.mark.django_db
def test_sync_claimed_freebies(auth_client, regular_user, test_data):
    f1 = test_data["f1"]
    f2 = test_data["f2"]

    # Pre-save f2 as unclaimed on user account
    UserFreebie.objects.create(user=regular_user, freebie=f2, claimed=False)

    # Guest checked off f1 (new) and f2 (upgrade from unclaimed to claimed)
    payload = {
        "meetup_ids": [],
        "freebie_ids": [f1.id, f2.id],
        "claimed_freebie_ids": [f1.id, f2.id],
        "album_ids": [],
    }
    res = auth_client.post("/api/v1/auth/sync-saves/", payload, content_type="application/json")
    assert res.status_code == 200
    data = res.json()
    assert data["added_freebies"] == 1  # f1 is newly created as claimed
    assert data["claimed_freebies_updated"] == 1  # f2 was updated to claimed=True

    uf1 = UserFreebie.objects.get(user=regular_user, freebie=f1)
    assert uf1.claimed is True
    assert uf1.claimed_at is not None

    uf2 = UserFreebie.objects.get(user=regular_user, freebie=f2)
    assert uf2.claimed is True
    assert uf2.claimed_at is not None


@pytest.mark.django_db
def test_sync_saves_empty_or_invalid_ids(auth_client, regular_user):
    payload = {
        "meetup_ids": [999999, "invalid"],
        "freebie_ids": [],
        "album_ids": [888888],
    }
    res = auth_client.post("/api/v1/auth/sync-saves/", payload, content_type="application/json")
    assert res.status_code == 200
    data = res.json()
    assert data["added_meetups"] == 0
    assert data["added_freebies"] == 0
    assert data["added_albums"] == 0
