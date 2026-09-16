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


def build_token_redirect_url(user: AbstractBaseUser, base_url: str | None = None) -> str:
    """Return a frontend URL carrying a fresh SimpleJWT pair in the fragment."""
    refresh = RefreshToken.for_user(user)
    payload = {
        "access_token": str(refresh.access_token),
        "refresh_token": str(refresh),
    }
    base = base_url or f"{settings.FRONTEND_URL}/auth/callback"
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
        user.display_name = (
            data.get("global_name") or data.get("name") or data.get("username") or user.username
        )
        avatar_url = _discord_avatar_url(data) if provider_id == "discord" else data.get("picture")
        if avatar_url:
            user.avatar_url = avatar_url
        return user


class CustomAccountAdapter(DefaultAccountAdapter):
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
        if signal_kwargs and "sociallogin" in signal_kwargs:
            return HttpResponseRedirect(build_token_redirect_url(user, base_url=redirect_url))
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
