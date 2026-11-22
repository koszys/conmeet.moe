from datetime import UTC, datetime

import pytest
from comments.models import Comment, CommentSetting
from conventions.models import Convention
from django.contrib.auth import get_user_model
from meetups.models import Meetup, MeetupAlbum
from rest_framework import status
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db
User = get_user_model()


@pytest.fixture
def convention() -> Convention:
    return Convention.objects.create(
        name="Anime Matsuri 2027",
        slug="anime-matsuri-2027",
        venue_name="George R. Brown Convention Center",
        city="Houston",
        country="USA",
        starts_at="2027-08-01",
        ends_at="2027-08-03",
    )


@pytest.fixture
def meetup(convention: Convention, regular_user: User) -> Meetup:
    return Meetup.objects.create(
        convention=convention,
        created_by=regular_user,
        name="Vocaloid Meetup",
        slug="vocaloid-meetup",
        location="Hall A",
        starts_at=datetime(2027, 8, 1, 14, 0, tzinfo=UTC),
        ends_at=datetime(2027, 8, 1, 16, 0, tzinfo=UTC),
    )


@pytest.fixture
def album(meetup: Meetup, regular_user: User) -> MeetupAlbum:
    return MeetupAlbum.objects.create(
        meetup=meetup,
        created_by=regular_user,
        title="Cosplay Showcase",
        description="Photos from the main stage",
    )


@pytest.fixture
def regular_user() -> User:
    return User.objects.create_user(
        username="miku_fan",
        email="miku@example.com",
        password="password123",
        display_name="Hatsune Miku",
    )


@pytest.fixture
def other_user() -> User:
    return User.objects.create_user(
        username="rin_fan",
        email="rin@example.com",
        password="password123",
        display_name="Kagamine Rin",
    )


@pytest.fixture
def staff_user() -> User:
    return User.objects.create_user(
        username="admin_staff",
        email="admin@example.com",
        password="password123",
        is_staff=True,
    )


@pytest.fixture
def auth_client(regular_user: User) -> APIClient:
    client = APIClient()
    client.force_authenticate(user=regular_user)
    return client


@pytest.fixture
def anon_client() -> APIClient:
    return APIClient()


# ---------------------------------------------------------------------------
# Settings Endpoint Tests
# ---------------------------------------------------------------------------


def test_comment_settings_endpoint(anon_client: APIClient):
    resp = anon_client.get("/api/v1/comments/settings/")
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert "unmount_all_comment_sections" in data
    assert "unmount_all_meetup_comments" in data
    assert "unmount_all_album_comments" in data
    assert data["unmount_all_comment_sections"] is False


# ---------------------------------------------------------------------------
# Meetup Comment Creation, Author Data, Character Limits
# ---------------------------------------------------------------------------


def test_meetup_comment_unauthenticated(anon_client: APIClient, meetup: Meetup):
    resp = anon_client.post(
        f"/api/v1/meetups/{meetup.id}/comments/",
        {"body": "Hello anonymous"},
    )
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED


def test_meetup_comment_create_and_author_has_no_badges(
    auth_client: APIClient, regular_user: User, meetup: Meetup
):
    resp = auth_client.post(
        f"/api/v1/meetups/{meetup.id}/comments/",
        {"body": "Looking forward to this meetup!"},
    )
    assert resp.status_code == status.HTTP_201_CREATED
    data = resp.json()
    assert data["body"] == "Looking forward to this meetup!"
    assert data["parent"] is None
    assert data["is_deleted"] is False
    assert data["is_author"] is True
    assert data["can_delete"] is True

    # Author representation: only id, username, display_name, avatar_url (NO badges)
    author = data["author"]
    assert author["id"] == regular_user.id
    assert author["username"] == "miku_fan"
    assert author["display_name"] == "Hatsune Miku"
    assert "role" not in author
    assert "is_staff" not in author
    assert "badges" not in author
    assert "badge" not in author


def test_meetup_comment_slug_lookup(auth_client: APIClient, meetup: Meetup):
    resp = auth_client.post(
        f"/api/v1/meetups/{meetup.slug}/comments/",
        {"body": "Posting using slug!"},
    )
    assert resp.status_code == status.HTTP_201_CREATED
    assert resp.json()["body"] == "Posting using slug!"


def test_comment_max_length_500_enforcement(auth_client: APIClient, meetup: Meetup):
    # Exactly 500 chars -> OK
    exact_500 = "a" * 500
    resp_ok = auth_client.post(
        f"/api/v1/meetups/{meetup.id}/comments/",
        {"body": exact_500},
    )
    assert resp_ok.status_code == status.HTTP_201_CREATED

    # 501 chars -> 400 Bad Request
    over_500 = "a" * 501
    resp_err = auth_client.post(
        f"/api/v1/meetups/{meetup.id}/comments/",
        {"body": over_500},
    )
    assert resp_err.status_code == status.HTTP_400_BAD_REQUEST
    assert "body" in resp_err.json()


def test_comment_empty_or_whitespace_rejected(auth_client: APIClient, meetup: Meetup):
    resp = auth_client.post(
        f"/api/v1/meetups/{meetup.id}/comments/",
        {"body": "    "},
    )
    assert resp.status_code == status.HTTP_400_BAD_REQUEST


# ---------------------------------------------------------------------------
# Replies & Threading
# ---------------------------------------------------------------------------


def test_meetup_comment_reply_and_nesting(
    auth_client: APIClient, other_user: User, meetup: Meetup
):
    # Create top level comment
    c1 = Comment.objects.create(
        meetup=meetup, author=other_user, body="Who is cosplaying Luka?"
    )

    # Reply to c1
    resp = auth_client.post(
        f"/api/v1/meetups/{meetup.id}/comments/",
        {"body": "I am cosplaying Luka!", "parent": c1.id},
    )
    assert resp.status_code == status.HTTP_201_CREATED
    data = resp.json()
    assert data["parent"] == c1.id

    # Fetch list
    list_resp = auth_client.get(f"/api/v1/meetups/{meetup.id}/comments/")
    assert list_resp.status_code == status.HTTP_200_OK
    comments = list_resp.json()
    assert len(comments) == 1
    assert comments[0]["id"] == c1.id
    assert len(comments[0]["replies"]) == 1
    assert comments[0]["replies"][0]["body"] == "I am cosplaying Luka!"


def test_reply_to_reply_allowed_and_shows_username(
    auth_client: APIClient, regular_user: User, other_user: User, meetup: Meetup
):
    # Level 0 (Top level)
    c0 = Comment.objects.create(meetup=meetup, author=regular_user, body="Top level")
    # Level 1 (Reply to c0)
    c1 = Comment.objects.create(
        meetup=meetup, author=other_user, parent=c0, body="First level reply"
    )

    # Reply to c1 (Level 2)
    resp = auth_client.post(
        f"/api/v1/meetups/{meetup.id}/comments/",
        {"body": "Second level reply", "parent": c1.id},
    )
    assert resp.status_code == status.HTTP_201_CREATED
    data = resp.json()
    assert data["parent"] == c1.id
    assert data["reply_to_username"] == other_user.username

    # Reply to Level 2 (Level 3)
    c2_id = data["id"]
    resp3 = auth_client.post(
        f"/api/v1/meetups/{meetup.id}/comments/",
        {"body": "Third level reply", "parent": c2_id},
    )
    assert resp3.status_code == status.HTTP_201_CREATED
    assert resp3.json()["reply_to_username"] == regular_user.username

    # Verify nested tree in GET
    list_resp = auth_client.get(f"/api/v1/meetups/{meetup.id}/comments/")
    assert list_resp.status_code == status.HTTP_200_OK
    tree = list_resp.json()
    assert len(tree) == 1
    assert tree[0]["id"] == c0.id
    assert len(tree[0]["replies"]) == 1
    l1 = tree[0]["replies"][0]
    assert l1["id"] == c1.id
    assert len(l1["replies"]) == 1
    l2 = l1["replies"][0]
    assert l2["id"] == c2_id
    assert len(l2["replies"]) == 1
    l3 = l2["replies"][0]
    assert l3["body"] == "Third level reply"


def test_reply_depth_limit_enforced(
    auth_client: APIClient, regular_user: User, meetup: Meetup
):
    # Create chain of 5 levels: c0 -> c1 -> c2 -> c3 -> c4
    c = Comment.objects.create(meetup=meetup, author=regular_user, body="Level 0")
    for i in range(1, 5):
        c = Comment.objects.create(
            meetup=meetup, author=regular_user, parent=c, body=f"Level {i}"
        )

    # Now c is Level 4 (depth 4). Attempting to reply to c would be Level 5.
    resp = auth_client.post(
        f"/api/v1/meetups/{meetup.id}/comments/",
        {"body": "Level 5 attempt", "parent": c.id},
    )
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "parent" in resp.json()
    assert "Maximum reply depth" in str(resp.json()["parent"])


def test_nested_soft_delete_preserves_descendant_thread(
    auth_client: APIClient, regular_user: User, other_user: User, meetup: Meetup
):
    c0 = Comment.objects.create(meetup=meetup, author=regular_user, body="L0")
    c1 = Comment.objects.create(meetup=meetup, author=other_user, parent=c0, body="L1")
    c2 = Comment.objects.create(meetup=meetup, author=regular_user, parent=c1, body="L2")

    # Soft delete intermediate reply c1
    c1.deleted_at = datetime.now(tz=UTC)
    c1.save()

    # GET response should show c0, c1 as [deleted] anchor, and c2 alive
    resp = auth_client.get(f"/api/v1/meetups/{meetup.id}/comments/")
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert len(data) == 1
    l0 = data[0]
    assert len(l0["replies"]) == 1
    l1 = l0["replies"][0]
    assert l1["is_deleted"] is True
    assert l1["body"] == "[deleted]"
    assert len(l1["replies"]) == 1
    l2 = l1["replies"][0]
    assert l2["id"] == c2.id
    assert l2["is_deleted"] is False
    assert l2["body"] == "L2"


def test_cross_target_reply_rejected(
    auth_client: APIClient,
    convention: Convention,
    regular_user: User,
    meetup: Meetup,
    album: MeetupAlbum,
):
    other_meetup = Meetup.objects.create(
        convention=convention,
        created_by=regular_user,
        name="Other Meetup",
        slug="other-meetup",
        location="Hall B",
        starts_at=datetime(2027, 8, 1, 17, 0, tzinfo=UTC),
        ends_at=datetime(2027, 8, 1, 18, 0, tzinfo=UTC),
    )
    c_other = Comment.objects.create(
        meetup=other_meetup, author=regular_user, body="Other meetup comment"
    )

    # Try replying to c_other in meetup
    resp = auth_client.post(
        f"/api/v1/meetups/{meetup.id}/comments/",
        {"body": "Invalid cross target", "parent": c_other.id},
    )
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "parent" in resp.json()

    # Try replying to meetup comment in album
    resp2 = auth_client.post(
        f"/api/v1/albums/{album.id}/comments/",
        {"body": "Invalid cross target", "parent": c_other.id},
    )
    assert resp2.status_code == status.HTTP_400_BAD_REQUEST
    assert "parent" in resp2.json()


# ---------------------------------------------------------------------------
# Album Comments
# ---------------------------------------------------------------------------


def test_album_comment_create_and_reply(auth_client: APIClient, album: MeetupAlbum):
    resp = auth_client.post(
        f"/api/v1/albums/{album.id}/comments/",
        {"body": "Awesome photos!"},
    )
    assert resp.status_code == status.HTTP_201_CREATED
    parent_id = resp.json()["id"]

    reply_resp = auth_client.post(
        f"/api/v1/albums/{album.id}/comments/",
        {"body": "Thanks for checking them out!", "parent": parent_id},
    )
    assert reply_resp.status_code == status.HTTP_201_CREATED

    get_resp = auth_client.get(f"/api/v1/albums/{album.id}/comments/")
    assert get_resp.status_code == status.HTTP_200_OK
    data = get_resp.json()
    assert len(data) == 1
    assert data[0]["body"] == "Awesome photos!"
    assert len(data[0]["replies"]) == 1
    assert data[0]["replies"][0]["body"] == "Thanks for checking them out!"


# ---------------------------------------------------------------------------
# Write-Once Policy & Deletion
# ---------------------------------------------------------------------------


def test_write_once_no_patch_or_put(auth_client: APIClient, meetup: Meetup, regular_user: User):
    comment = Comment.objects.create(
        meetup=meetup, author=regular_user, body="Original comment"
    )
    patch_resp = auth_client.patch(
        f"/api/v1/comments/{comment.id}/",
        {"body": "Attempted edit"},
    )
    assert patch_resp.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

    put_resp = auth_client.put(
        f"/api/v1/comments/{comment.id}/",
        {"body": "Attempted edit"},
    )
    assert put_resp.status_code == status.HTTP_405_METHOD_NOT_ALLOWED


def test_comment_deletion_permissions(
    regular_user: User, other_user: User, staff_user: User, meetup: Meetup
):
    comment = Comment.objects.create(
        meetup=meetup, author=regular_user, body="To be deleted"
    )

    other_client = APIClient()
    other_client.force_authenticate(user=other_user)
    resp = other_client.delete(f"/api/v1/comments/{comment.id}/")
    assert resp.status_code == status.HTTP_403_FORBIDDEN

    # Owner delete succeeds
    owner_client = APIClient()
    owner_client.force_authenticate(user=regular_user)
    resp_owner = owner_client.delete(f"/api/v1/comments/{comment.id}/")
    assert resp_owner.status_code == status.HTTP_204_NO_CONTENT
    comment.refresh_from_db()
    assert comment.is_deleted is True


def test_staff_can_delete_comment(
    regular_user: User, staff_user: User, meetup: Meetup
):
    comment = Comment.objects.create(
        meetup=meetup, author=regular_user, body="Staff will delete this"
    )
    staff_client = APIClient()
    staff_client.force_authenticate(user=staff_user)
    resp = staff_client.delete(f"/api/v1/comments/{comment.id}/")
    assert resp.status_code == status.HTTP_204_NO_CONTENT
    comment.refresh_from_db()
    assert comment.is_deleted is True


def test_soft_delete_preserves_replies_in_thread(
    auth_client: APIClient, regular_user: User, other_user: User, meetup: Meetup
):
    c1 = Comment.objects.create(
        meetup=meetup, author=regular_user, body="Parent with active reply"
    )
    c2 = Comment.objects.create(
        meetup=meetup, author=other_user, parent=c1, body="Active reply"
    )

    # Soft delete parent
    c1.deleted_at = datetime.now(tz=UTC)
    c1.save()

    # GET comments: c1 is still rendered to anchor c2, but with [deleted] placeholder
    resp = auth_client.get(f"/api/v1/meetups/{meetup.id}/comments/")
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert len(data) == 1
    assert data[0]["id"] == c1.id
    assert data[0]["is_deleted"] is True
    assert data[0]["body"] == "[deleted]"
    assert data[0]["author"] is None
    assert len(data[0]["replies"]) == 1
    assert data[0]["replies"][0]["id"] == c2.id
    assert data[0]["replies"][0]["body"] == "Active reply"


def test_soft_deleted_comment_without_replies_hidden(
    auth_client: APIClient, regular_user: User, meetup: Meetup
):
    c1 = Comment.objects.create(
        meetup=meetup, author=regular_user, body="Deleted lonely comment"
    )
    c1.deleted_at = datetime.now(tz=UTC)
    c1.save()

    resp = auth_client.get(f"/api/v1/meetups/{meetup.id}/comments/")
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json() == []


def test_reply_to_deleted_comment_rejected(
    auth_client: APIClient, regular_user: User, meetup: Meetup
):
    c1 = Comment.objects.create(meetup=meetup, author=regular_user, body="Will delete")
    c1.deleted_at = datetime.now(tz=UTC)
    c1.save()

    resp = auth_client.post(
        f"/api/v1/meetups/{meetup.id}/comments/",
        {"body": "Attempt reply to deleted", "parent": c1.id},
    )
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "parent" in resp.json()


# ---------------------------------------------------------------------------
# Unmount Control Hierarchy
# ---------------------------------------------------------------------------


def test_specific_meetup_unmount(
    auth_client: APIClient, convention: Convention, regular_user: User, meetup: Meetup
):
    other_meetup = Meetup.objects.create(
        convention=convention,
        created_by=regular_user,
        name="Active Meetup",
        slug="active-meetup",
        location="Hall C",
        starts_at=datetime(2027, 8, 1, 10, 0, tzinfo=UTC),
        ends_at=datetime(2027, 8, 1, 12, 0, tzinfo=UTC),
        unmount_comments=False,
    )

    # Unmount specific meetup
    meetup.unmount_comments = True
    meetup.save()

    # Unmounted meetup: GET returns [], POST returns 403
    get_resp = auth_client.get(f"/api/v1/meetups/{meetup.id}/comments/")
    assert get_resp.status_code == status.HTTP_200_OK
    assert get_resp.json() == []

    post_resp = auth_client.post(
        f"/api/v1/meetups/{meetup.id}/comments/",
        {"body": "Trying to post on unmounted meetup"},
    )
    assert post_resp.status_code == status.HTTP_403_FORBIDDEN

    # Active meetup: works normally
    post_other = auth_client.post(
        f"/api/v1/meetups/{other_meetup.id}/comments/",
        {"body": "Posting on active meetup"},
    )
    assert post_other.status_code == status.HTTP_201_CREATED


def test_specific_album_unmount(
    auth_client: APIClient, meetup: Meetup, regular_user: User, album: MeetupAlbum
):
    other_album = MeetupAlbum.objects.create(
        meetup=meetup,
        created_by=regular_user,
        title="Active Album",
        unmount_comments=False,
    )

    # Unmount specific album
    album.unmount_comments = True
    album.save()

    # Unmounted album: GET returns [], POST returns 403
    get_resp = auth_client.get(f"/api/v1/albums/{album.id}/comments/")
    assert get_resp.status_code == status.HTTP_200_OK
    assert get_resp.json() == []

    post_resp = auth_client.post(
        f"/api/v1/albums/{album.id}/comments/",
        {"body": "Trying to post on unmounted album"},
    )
    assert post_resp.status_code == status.HTTP_403_FORBIDDEN

    # Active album: works normally
    post_other = auth_client.post(
        f"/api/v1/albums/{other_album.id}/comments/",
        {"body": "Posting on active album"},
    )
    assert post_other.status_code == status.HTTP_201_CREATED


def test_category_meetup_unmount(
    auth_client: APIClient, meetup: Meetup, album: MeetupAlbum
):
    setting = CommentSetting.get_settings()
    setting.unmount_all_meetup_comments = True
    setting.save()

    # Meetup comments unmounted
    assert auth_client.get(f"/api/v1/meetups/{meetup.id}/comments/").json() == []
    post_m = auth_client.post(
        f"/api/v1/meetups/{meetup.id}/comments/",
        {"body": "Meetup comment"},
    )
    assert post_m.status_code == status.HTTP_403_FORBIDDEN

    # Album comments still work
    post_a = auth_client.post(
        f"/api/v1/albums/{album.id}/comments/",
        {"body": "Album comment"},
    )
    assert post_a.status_code == status.HTTP_201_CREATED


def test_category_album_unmount(
    auth_client: APIClient, meetup: Meetup, album: MeetupAlbum
):
    setting = CommentSetting.get_settings()
    setting.unmount_all_album_comments = True
    setting.save()

    # Album comments unmounted
    assert auth_client.get(f"/api/v1/albums/{album.id}/comments/").json() == []
    post_a = auth_client.post(
        f"/api/v1/albums/{album.id}/comments/",
        {"body": "Album comment"},
    )
    assert post_a.status_code == status.HTTP_403_FORBIDDEN

    # Meetup comments still work
    post_m = auth_client.post(
        f"/api/v1/meetups/{meetup.id}/comments/",
        {"body": "Meetup comment"},
    )
    assert post_m.status_code == status.HTTP_201_CREATED


def test_global_sitewide_unmount(
    auth_client: APIClient, meetup: Meetup, album: MeetupAlbum
):
    setting = CommentSetting.get_settings()
    setting.unmount_all_comment_sections = True
    setting.save()

    # Both unmounted
    assert auth_client.get(f"/api/v1/meetups/{meetup.id}/comments/").json() == []
    assert auth_client.get(f"/api/v1/albums/{album.id}/comments/").json() == []

    post_m = auth_client.post(
        f"/api/v1/meetups/{meetup.id}/comments/",
        {"body": "Meetup comment"},
    )
    assert post_m.status_code == status.HTTP_403_FORBIDDEN

    post_a = auth_client.post(
        f"/api/v1/albums/{album.id}/comments/",
        {"body": "Album comment"},
    )
    assert post_a.status_code == status.HTTP_403_FORBIDDEN
