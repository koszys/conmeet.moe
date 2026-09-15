from typing import Any

import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

pytestmark = pytest.mark.django_db


def _authed_client(user: Any) -> APIClient:
    client = APIClient()
    client.force_authenticate(user=user)
    return client


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
