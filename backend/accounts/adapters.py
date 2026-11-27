import logging
from typing import Any, cast
from urllib.parse import urlencode

from allauth.account.adapter import DefaultAccountAdapter
from allauth.account.models import EmailAddress
from allauth.core.exceptions import ImmediateHttpResponse
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.socialaccount.models import SocialAccount, SocialLogin
from allauth.socialaccount.providers.base import AuthError
from django.conf import settings
from django.contrib.auth.base_user import AbstractBaseUser
from django.db import transaction
from django.http import HttpRequest, HttpResponse, HttpResponseRedirect
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User

logger = logging.getLogger(__name__)


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
    def get_auth_params(self, request: HttpRequest, app: Any) -> dict[str, Any]:
        params = dict(super().get_auth_params(request, app))
        link_data = request.session.get("pending_social_link")
        if (
            link_data
            and link_data.get("mode") == "relink"
            and link_data.get("provider") == app.provider
            and app.provider == "google"
        ):
            params["prompt"] = "select_account"
        return params

    def on_authentication_error(
        self,
        request: HttpRequest,
        provider: Any,
        error: str | None = None,
        exception: Exception | None = None,
        extra_context: dict[str, Any] | None = None,
    ) -> None:
        link_data = request.session.pop("pending_social_link", None)
        error_code = "cancelled" if error == AuthError.CANCELLED else "oauth_error"

        if link_data:
            next_url = link_data.get("next") or "/settings"
            raise ImmediateHttpResponse(
                HttpResponseRedirect(
                    f"{settings.FRONTEND_URL}{next_url}?link_error={error_code}"
                )
            )

        state = (extra_context or {}).get("state") or {}
        next_url = state.get("next")
        params: dict[str, str] = {"error": error_code}
        if isinstance(next_url, str) and next_url.startswith("/") and not next_url.startswith("//"):
            params["next"] = next_url

        raise ImmediateHttpResponse(
            HttpResponseRedirect(f"{settings.FRONTEND_URL}/login?{urlencode(params)}")
        )

    def pre_social_login(self, request: HttpRequest, sociallogin: SocialLogin) -> None:
        link_data = request.session.pop("pending_social_link", None)
        if not link_data or link_data.get("provider") != sociallogin.account.provider:
            return

        target_user = User.objects.filter(id=link_data.get("user_id")).first()
        if not target_user:
            logger.warning("pre_social_login: target_user not found for link_data=%s", link_data)
            return

        existing_account = SocialAccount.objects.filter(
            provider=sociallogin.account.provider,
            uid=sociallogin.account.uid,
        ).first()

        logger.info(
            "pre_social_login link: user_id=%s provider=%s mode=%s account_exists=%s",
            target_user.id,
            sociallogin.account.provider,
            link_data.get("mode"),
            bool(existing_account),
        )

        next_url = link_data.get("next") or "/settings"

        if existing_account and existing_account.user_id != target_user.id:
            raise ImmediateHttpResponse(
                HttpResponseRedirect(
                    f"{settings.FRONTEND_URL}{next_url}?link_error=already_linked"
                )
            )

        external_email = (
            (getattr(sociallogin.user, "email", None) or "")
            or ((sociallogin.account.extra_data or {}).get("email") or "")
            or next((ea.email for ea in sociallogin.email_addresses if ea.email), "")
        ).strip()

        if not existing_account:
            with transaction.atomic():
                if link_data.get("mode") == "relink":
                    old_accounts = list(
                        SocialAccount.objects.filter(
                            user=target_user, provider=sociallogin.account.provider
                        )
                    )
                    for old_acc in old_accounts:
                        old_email = ((old_acc.extra_data or {}).get("email") or "").strip()
                        old_acc.delete()
                        if old_email and old_email.lower() != (target_user.email or "").lower():
                            EmailAddress.objects.filter(
                                user=target_user, email__iexact=old_email, primary=False
                            ).delete()

                if external_email and not (sociallogin.account.extra_data or {}).get("email"):
                    sociallogin.account.extra_data = {
                        **(sociallogin.account.extra_data or {}),
                        "email": external_email,
                    }
                sociallogin.connect(request, target_user)

                if (
                    external_email
                    and not EmailAddress.objects.filter(email__iexact=external_email)
                    .exclude(user=target_user)
                    .exists()
                    and not EmailAddress.objects.filter(
                        user=target_user, email__iexact=external_email
                    ).exists()
                ):
                    EmailAddress.objects.create(
                        user=target_user,
                        email=external_email,
                        verified=True,
                        primary=False,
                    )

        redirect_url = build_token_redirect_url(
            target_user,
            next_url=f"{next_url}?linked={sociallogin.account.provider}",
        )
        raise ImmediateHttpResponse(HttpResponseRedirect(redirect_url))

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
