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


def test_social_account_truncates_long_username_to_20_chars() -> None:
    long_username_data = {
        "id": "777888",
        "username": "super_long_discord_username_exceeding_twenty",
        "global_name": "Long Name",
        "email": "long@example.com",
    }
    user = _populate(long_username_data)
    assert len(user.username) <= 20
    assert user.username == "super_long_discord_u"


def test_generate_unique_username_respects_20_char_limit() -> None:
    adapter = CustomAccountAdapter()
    generated = adapter.generate_unique_username(["very_long_seed_name_over_twenty_characters"])
    assert len(generated) <= 20

    # Ensure collision suffix also respects the 20 character limit
    User = get_user_model()
    User.objects.create_user(username=generated, email="existing@example.com")
    collision_res = adapter.generate_unique_username(["very_long_seed_name_over_twenty_characters"])
    assert len(collision_res) <= 20
    assert collision_res != generated


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


def test_post_login_preserves_next_url_in_callback() -> None:
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
        redirect_url="/conventions/anime-expo/meetups/42",
    )

    assert resp.status_code == 302
    parsed = urlparse(resp["Location"])
    assert parsed.scheme == "http"
    assert parsed.netloc == "localhost:3000"
    assert parsed.path == "/auth/callback"
    assert parse_qs(parsed.query)["next"][0] == "/conventions/anime-expo/meetups/42"
    fragment_params = parse_qs(parsed.fragment)
    assert "access_token" in fragment_params and "refresh_token" in fragment_params


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
    site = Site.objects.get_or_create(pk=1, defaults={"domain": "localhost", "name": "localhost"})[
        0
    ]
    app, _ = SocialApp.objects.get_or_create(
        provider="google", defaults={"name": "Google", "client_id": "x", "secret": "y"}
    )
    app.sites.add(site)
    return app


def _google_sociallogin(provider_email: str, provider_email_verified: bool) -> SocialLogin:
    request = RequestFactory().get("/accounts/google/login/callback/")
    request.session = SessionStore()
    provider = GoogleProvider(request, app=SocialApp(provider="google"))
    return SocialLogin(
        user=get_user_model()(),
        provider=provider,
        account=SocialAccount(provider="google", uid="999999"),
        email_addresses=[EmailAddress(email=provider_email, verified=provider_email_verified)],
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

    assert SocialAccount.objects.filter(user=existing, provider="google", uid="999999").exists()


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


def test_post_login_detects_username_collision_on_signup() -> None:
    # A user whose preferred username was 'cosmo' ended up with 'cosmo1' due to collision
    user = get_user_model().objects.create_user(username="cosmo1", email="newuser@example.com")
    sociallogin = SocialLogin(user=user)
    sociallogin.state["preferred_username"] = "cosmo"

    request = RequestFactory().get("/accounts/discord/login/callback/")
    resp = CustomAccountAdapter().post_login(
        request,
        user,
        email_verification="none",
        signal_kwargs={"sociallogin": sociallogin, "email_verification": "none"},
        email="newuser@example.com",
        signup=True,
        redirect_url="/settings",
    )

    assert resp.status_code == 302
    parsed = urlparse(resp["Location"])
    query_params = parse_qs(parsed.query)
    assert query_params.get("username_collision") == ["1"]
