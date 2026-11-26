import io
from typing import Any

import pytest
from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

pytestmark = pytest.mark.django_db


def _authed_client(user: Any) -> APIClient:
    client = APIClient()
    client.force_authenticate(user=user)
    return client


def _create_test_image(
    name: str = "avatar.png",
    color: str = "red",
    format: str = "PNG",
    content_type: str = "image/png",
) -> SimpleUploadedFile:
    img = Image.new("RGB", (64, 64), color=color)
    buf = io.BytesIO()
    img.save(buf, format=format)
    return SimpleUploadedFile(name, buf.getvalue(), content_type=content_type)


def test_me_authenticated() -> None:
    user = get_user_model().objects.create_user(username="cosmo", email="cosmo@example.com")
    user.display_name = "Cosmo"
    user.avatar_url = "https://cdn.discordapp.com/avatars/1/abc.png"
    user.save()

    resp = _authed_client(user).get("/api/v1/auth/me/")

    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert data["id"] == user.pk
    assert data["username"] == "cosmo"
    assert data["display_name"] == "Cosmo"
    assert data["avatar_url"].endswith(".png")
    assert data["role"] == "user"
    assert data["providers"] == []


def test_me_lists_linked_providers() -> None:
    user = get_user_model().objects.create_user(username="cosmo", email="cosmo@example.com")
    from allauth.socialaccount.models import SocialAccount

    SocialAccount.objects.create(user=user, provider="discord", uid="111")
    SocialAccount.objects.create(user=user, provider="google", uid="222")

    data = _authed_client(user).get("/api/v1/auth/me/").json()

    assert data["providers"] == ["discord", "google"]


def test_me_anonymous() -> None:
    resp = APIClient().get("/api/v1/auth/me/")
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED


def test_refresh_issues_new_access() -> None:
    user = get_user_model().objects.create_user(username="cosmo", email="cosmo@example.com")
    refresh = RefreshToken.for_user(user)

    resp = APIClient().post("/api/v1/auth/refresh/", {"refresh": str(refresh)}, format="json")

    assert resp.status_code == status.HTTP_200_OK
    assert "access" in resp.json()


def test_refresh_rejects_garbage() -> None:
    resp = APIClient().post("/api/v1/auth/refresh/", {"refresh": "nope"}, format="json")
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED


def test_logout_requires_auth_and_returns_204() -> None:
    user = get_user_model().objects.create_user(username="cosmo", email="cosmo@example.com")

    anon = APIClient().post("/api/v1/auth/logout/")
    assert anon.status_code == status.HTTP_401_UNAUTHORIZED

    authed = _authed_client(user).post("/api/v1/auth/logout/")
    assert authed.status_code == status.HTTP_204_NO_CONTENT


def test_username_max_length_20_enforced() -> None:
    from django.core.exceptions import ValidationError

    User = get_user_model()

    # 20 characters is valid
    valid_user = User.objects.create_user(username="a" * 20, email="valid20@example.com")
    valid_user.full_clean()
    assert valid_user.username == "a" * 20

    # 21 characters fails validation
    invalid_user = User(username="a" * 21, email="invalid21@example.com")
    invalid_user.set_unusable_password()
    with pytest.raises(ValidationError) as exc_info:
        invalid_user.full_clean()
    assert "username" in exc_info.value.message_dict


def test_patch_me_unauthenticated_returns_401() -> None:
    resp = APIClient().patch("/api/v1/auth/me/", {"display_name": "New Name"})
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED


def test_patch_me_updates_display_name_and_username() -> None:
    user = get_user_model().objects.create_user(username="miku", email="miku@example.com")
    user.display_name = "Hatsune"
    user.save()

    client = _authed_client(user)
    resp = client.patch(
        "/api/v1/auth/me/",
        {"display_name": "Hatsune Miku", "username": "miku_39"},
        format="json",
    )

    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert data["username"] == "miku_39"
    assert data["display_name"] == "Hatsune Miku"

    user.refresh_from_db()
    assert user.username == "miku_39"
    assert user.display_name == "Hatsune Miku"

    # Display name > 20 chars rejected
    resp_long = client.patch(
        "/api/v1/auth/me/",
        {"display_name": "a" * 21},
        format="json",
    )
    assert resp_long.status_code == status.HTTP_400_BAD_REQUEST
    assert "display_name" in resp_long.json()


def test_patch_me_username_validation_and_uniqueness() -> None:
    User = get_user_model()
    User.objects.create_user(username="taken_user", email="taken@example.com")
    user = User.objects.create_user(username="my_user", email="me@example.com")

    client = _authed_client(user)

    # 1. Duplicate username
    resp = client.patch("/api/v1/auth/me/", {"username": "taken_user"}, format="json")
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "username" in resp.json()

    # 2. Case-insensitive duplicate username
    resp = client.patch("/api/v1/auth/me/", {"username": "TAKEN_USER"}, format="json")
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "username" in resp.json()

    # 3. Reserved username
    resp = client.patch("/api/v1/auth/me/", {"username": "admin"}, format="json")
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "reserved" in resp.json()["username"][0]

    # 4. Same username for self is allowed
    resp = client.patch("/api/v1/auth/me/", {"username": "my_user"}, format="json")
    assert resp.status_code == status.HTTP_200_OK

    # 5. Over 20 chars rejected
    resp = client.patch("/api/v1/auth/me/", {"username": "a" * 21}, format="json")
    assert resp.status_code == status.HTTP_400_BAD_REQUEST

    # 6. Blank username rejected
    resp = client.patch("/api/v1/auth/me/", {"username": "   "}, format="json")
    assert resp.status_code == status.HTTP_400_BAD_REQUEST


def test_patch_me_avatar_upload_precedence_and_cdn_cleanup() -> None:
    user = get_user_model().objects.create_user(username="cosmo_pfp", email="cosmo_pfp@example.com")
    user.avatar_url = "https://cdn.discordapp.com/avatars/1/social_pfp.png"
    user.save()

    client = _authed_client(user)

    # Initial check: no custom avatar, falls back to social avatar_url
    initial_resp = client.get("/api/v1/auth/me/")
    assert initial_resp.json()["avatar_url"] == "https://cdn.discordapp.com/avatars/1/social_pfp.png"
    assert initial_resp.json()["has_custom_avatar"] is False

    # 1. Upload custom avatar
    image_file = _create_test_image("custom_pfp.png", color="blue")
    upload_resp = client.patch("/api/v1/auth/me/", {"avatar": image_file}, format="multipart")
    assert upload_resp.status_code == status.HTTP_200_OK
    upload_data = upload_resp.json()
    assert upload_data["has_custom_avatar"] is True
    assert "avatar_" in upload_data["avatar_url"]
    assert "social_pfp.png" not in upload_data["avatar_url"]

    user.refresh_from_db()
    first_avatar_name = user.avatar.name
    assert default_storage.exists(first_avatar_name)

    # 2. Replace with a new avatar -> old one must be deleted from storage/CDN
    replacement_file = _create_test_image("new_pfp.png", color="green")
    replace_resp = client.patch("/api/v1/auth/me/", {"avatar": replacement_file}, format="multipart")
    assert replace_resp.status_code == status.HTTP_200_OK

    user.refresh_from_db()
    second_avatar_name = user.avatar.name
    assert second_avatar_name != first_avatar_name
    assert not default_storage.exists(first_avatar_name), "Previous avatar should be deleted from storage/CDN"
    assert default_storage.exists(second_avatar_name), "New avatar should exist in storage"

    # 3. Remove custom avatar -> deletes file from storage, reverts to social avatar_url
    remove_resp = client.patch("/api/v1/auth/me/", {"remove_avatar": True}, format="json")
    assert remove_resp.status_code == status.HTTP_200_OK
    remove_data = remove_resp.json()
    assert remove_data["has_custom_avatar"] is False
    assert remove_data["avatar_url"] == "https://cdn.discordapp.com/avatars/1/social_pfp.png"

    user.refresh_from_db()
    assert not user.avatar
    assert not default_storage.exists(second_avatar_name), "Removed avatar should be deleted from storage/CDN"


def test_patch_me_rejects_gif_avatar() -> None:
    user = get_user_model().objects.create_user(username="no_gif_user", email="nogif@example.com")
    client = _authed_client(user)

    gif_file = _create_test_image("avatar.gif", color="purple", format="GIF", content_type="image/gif")
    resp = client.patch("/api/v1/auth/me/", {"avatar": gif_file}, format="multipart")
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "avatar" in resp.json()
    assert "GIF" in resp.json()["avatar"][0]
