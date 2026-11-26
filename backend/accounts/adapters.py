from typing import Any, cast
from urllib.parse import urlencode

from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.socialaccount.models import SocialLogin
from django.conf import settings
from django.contrib.auth.base_user import AbstractBaseUser
from django.http import HttpRequest, HttpResponse, HttpResponseRedirect
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


def build_token_redirect_url(
    user: AbstractBaseUser,
    base_url: str | None = None,
    next_url: str | None = None,
    username_collision: bool = False,
) -> str:
    """Return a frontend URL carrying a fresh SimpleJWT pair in the fragment and optional next query param."""
    refresh = RefreshToken.for_user(user)
    payload = {
        "access_token": str(refresh.access_token),
        "refresh_token": str(refresh),
    }

    if base_url and (base_url.startswith("http://") or base_url.startswith("https://")):
        base = base_url
    else:
        if base_url and base_url.startswith("/") and not next_url:
            next_url = base_url
        base = f"{settings.FRONTEND_URL}/auth/callback"

    query_params: dict[str, str] = {}
    if next_url and next_url != "/" and next_url.startswith("/") and not next_url.startswith("//"):
        query_params["next"] = next_url
    if username_collision:
        query_params["username_collision"] = "1"

    if query_params:
        separator = "&" if "?" in base else "?"
        base = f"{base}{separator}{urlencode(query_params)}"

    return f"{base}#{urlencode(payload)}"


def _discord_avatar_url(data: dict[str, Any]) -> str | None:
    avatar = data.get("avatar")
    user_id = data.get("id")
    if avatar and user_id:
        return f"https://cdn.discordapp.com/avatars/{user_id}/{avatar}.png"
    return None


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def populate_user(
        self, request: HttpRequest, sociallogin: SocialLogin, data: dict[str, Any]
    ) -> User:
        user = super().populate_user(request, sociallogin, data)
        assert isinstance(user, User)
        provider_id = sociallogin.account.provider
        raw_display_name = (
            data.get("global_name") or data.get("name") or data.get("username") or user.username
        )
        if raw_display_name and len(raw_display_name) > 20:
            user.display_name = raw_display_name[:20]
        elif raw_display_name:
            user.display_name = raw_display_name
        avatar_url = _discord_avatar_url(data) if provider_id == "discord" else data.get("picture")
        if avatar_url:
            user.avatar_url = avatar_url

        raw_username = data.get("username") or (
            data.get("email", "").split("@")[0] if data.get("email") else None
        )
        if raw_username:
            sociallogin.state["preferred_username"] = raw_username[:20]

        if user.username and len(user.username) > 20:
            user.username = user.username[:20]
        return user


class CustomAccountAdapter(DefaultAccountAdapter):
    def generate_unique_username(
        self, txts: list[str | None], regex: str | None = None
    ) -> str:
        shortened_txts = [t[:20] if t else t for t in txts]
        return super().generate_unique_username(shortened_txts, regex)

    def post_login(
        self,
        request: HttpRequest,
        user: AbstractBaseUser,
        *,
        email_verification: str,
        signal_kwargs: dict[str, Any] | None,
        email: str | None,
        signup: bool,
        redirect_url: str | None,
    ) -> HttpResponse:
        is_collision = False
        if signup and signal_kwargs and "sociallogin" in signal_kwargs:
            sociallogin = signal_kwargs["sociallogin"]
            preferred = sociallogin.state.get("preferred_username")
            if preferred and getattr(user, "username", None) != preferred:
                is_collision = True

        if signal_kwargs and "sociallogin" in signal_kwargs:
            return HttpResponseRedirect(
                build_token_redirect_url(
                    user,
                    base_url=redirect_url,
                    username_collision=is_collision,
                )
            )
        response = super().post_login(
            request,
            user,
            email_verification=email_verification,
            signal_kwargs=signal_kwargs,
            email=email,
            signup=signup,
            redirect_url=redirect_url,
        )
        return cast(HttpResponse, response)
