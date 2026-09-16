from typing import Any
from unittest import mock
from urllib.parse import parse_qs, urlparse

import jwt
import pytest
from accounts.adapters import (
    CustomAccountAdapter,
    CustomSocialAccountAdapter,
    build_token_redirect_url,
)
from allauth.account.adapter import DefaultAccountAdapter
from allauth.account.models import EmailAddress
from allauth.core import context
from allauth.socialaccount.internal.flows.login import pre_social_login
from allauth.socialaccount.models import SocialAccount, SocialApp, SocialLogin
from allauth.socialaccount.providers.google.provider import GoogleProvider
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.sessions.backends.db import SessionStore
from django.contrib.sites.models import Site
from django.http import HttpResponseRedirect
from django.test import RequestFactory

pytestmark = pytest.mark.django_db

DISCORD_EXTRA_DATA = {
    "id": "123456",
    "username": "cosmo",
    "global_name": "Cosmo",
    "avatar": "abc123",
    "email": "cosmo@example.com",
}

GOOGLE_EXTRA_DATA = {
    "id": "987654",
    "name": "Cosmo Google",
    "picture": "https://lh3.googleusercontent.com/pic.png",
    "email": "cosmo.google@example.com",
}


def _populate(extra_data: dict[str, Any]) -> Any:
    User = get_user_model()
    provider = "discord" if "avatar" in extra_data else "google"
    sociallogin = SocialLogin(
        user=User(username="cosmo"),
        account=SocialAccount(provider=provider, uid=str(extra_data["id"])),
    )
    return CustomSocialAccountAdapter().populate_user(
        RequestFactory().get("/accounts/login/callback/"), sociallogin, extra_data
    )


def test_discord_user_population() -> None:
    user = _populate(DISCORD_EXTRA_DATA)
    assert user.display_name == "Cosmo"
    assert user.avatar_url == "https://cdn.discordapp.com/avatars/123456/abc123.png"


def test_google_user_population() -> None:
    user = _populate(GOOGLE_EXTRA_DATA)
    assert user.display_name == "Cosmo Google"
    assert user.avatar_url == "https://lh3.googleusercontent.com/pic.png"


def _user_id(token: str) -> int:
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    return int(payload["user_id"])


def test_build_token_redirect_url_carries_jwt_fragment() -> None:
    user = get_user_model().objects.create_user(username="cosmo", email="cosmo@example.com")

    url = build_token_redirect_url(user, base_url="http://localhost:3000/auth/callback")
    parsed = urlparse(url)
    assert parsed.scheme == "http"
    assert parsed.netloc == "localhost:3000"
    assert parsed.path == "/auth/callback"
    params = parse_qs(parsed.fragment)
    assert "access_token" in params and "refresh_token" in params
    assert _user_id(params["access_token"][0]) == user.pk


def test_post_login_issues_jwt_and_redirects() -> None:
    user = get_user_model().objects.create_user(username="cosmo", email="cosmo@example.com")
    sociallogin = SocialLogin(user=user)
    request = RequestFactory().get("/accounts/discord/login/callback/")

    resp = CustomAccountAdapter().post_login(
        request,
        user,
        email_verification="none",
        signal_kwargs={"sociallogin": sociallogin, "email_verification": "none"},
        email="cosmo@example.com",
        signup=False,
        redirect_url="http://localhost:3000/auth/callback",
    )

    assert resp.status_code == 302
    params = parse_qs(urlparse(resp["Location"]).fragment)
    assert "access_token" in params and "refresh_token" in params
    assert _user_id(params["access_token"][0]) == user.pk


def test_post_login_non_social_delegates_to_base() -> None:
    user = get_user_model().objects.create_user(username="cosmo", email="cosmo@example.com")
    request = RequestFactory().get("/accounts/login/")
    adapter = CustomAccountAdapter()

    with mock.patch.object(
        DefaultAccountAdapter, "post_login", return_value=HttpResponseRedirect("/")
    ) as delegated:
        resp = adapter.post_login(
            request,
            user,
            email_verification="none",
            signal_kwargs=None,
            email=None,
            signup=False,
            redirect_url="/",
        )

    delegated.assert_called_once()
    assert resp.status_code == 302
    assert resp["Location"] == "/"


def _google_app() -> SocialApp:
    site = Site.objects.get_or_create(
        pk=1, defaults={"domain": "localhost", "name": "localhost"}
    )[0]
    app, _ = SocialApp.objects.get_or_create(
        provider="google", defaults={"name": "Google", "client_id": "x", "secret": "y"}
    )
    app.sites.add(site)
    return app


def _google_sociallogin(
    provider_email: str, provider_email_verified: bool
) -> SocialLogin:
    request = RequestFactory().get("/accounts/google/login/callback/")
    request.session = SessionStore()
    provider = GoogleProvider(request, app=SocialApp(provider="google"))
    return SocialLogin(
        user=get_user_model()(),
        provider=provider,
        account=SocialAccount(provider="google", uid="999999"),
        email_addresses=[
            EmailAddress(email=provider_email, verified=provider_email_verified)
        ],
    )


def test_email_authentication_resolves_and_connects_existing_user() -> None:
    User = get_user_model()
    existing = User.objects.create_user(username="cosmo", email="cosmo@example.com")
    EmailAddress.objects.create(
        user=existing, email="cosmo@example.com", verified=True, primary=True
    )
    _google_app()

    request = RequestFactory().get("/accounts/google/login/callback/")
    request.session = SessionStore()
    sociallogin = _google_sociallogin("cosmo@example.com", True)

    pre_social_login(request, sociallogin)

    assert sociallogin.user.pk == existing.pk
    assert sociallogin._did_authenticate_by_email == "cosmo@example.com"
    assert sociallogin.is_existing

    with context.request_context(request):
        sociallogin._accept_login(request)

    assert SocialAccount.objects.filter(
        user=existing, provider="google", uid="999999"
    ).exists()


def test_email_authentication_ignores_unverified_provider_email() -> None:
    User = get_user_model()
    existing = User.objects.create_user(username="cosmo", email="cosmo@example.com")
    EmailAddress.objects.create(
        user=existing, email="cosmo@example.com", verified=True, primary=True
    )

    request = RequestFactory().get("/accounts/google/login/callback/")
    request.session = SessionStore()
    sociallogin = _google_sociallogin("cosmo@example.com", False)

    pre_social_login(request, sociallogin)

    assert not sociallogin.is_existing
    assert sociallogin._did_authenticate_by_email is None
