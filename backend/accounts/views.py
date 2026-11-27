from urllib.parse import quote

from allauth.account.models import EmailAddress
from allauth.socialaccount.models import SocialAccount
from django.conf import settings
from django.core import signing
from django.db import transaction
from django.http import HttpRequest, HttpResponse, HttpResponseRedirect
from django.views import View
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import UserSerializer, UserUpdateSerializer

SUPPORTED_PROVIDERS = ("discord", "google")
LINK_TOKEN_SALT = "social-account-link"
LINK_TOKEN_MAX_AGE = 300


@api_view(["GET"])
def health(request: Request) -> Response:
    return Response({"status": "ok"})


class MeView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request: Request) -> Response:
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request: Request) -> Response:
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        return Response(status=204)


class ProviderUnlinkView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request: Request, provider: str) -> Response:
        if provider not in SUPPORTED_PROVIDERS:
            return Response({"detail": "Unsupported provider."}, status=status.HTTP_400_BAD_REQUEST)

        accounts = SocialAccount.objects.filter(user=request.user)
        if accounts.count() <= 1:
            return Response(
                {"detail": "At least one connected account must remain linked."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        target_accounts = list(accounts.filter(provider=provider))
        if not target_accounts:
            return Response(
                {"detail": "This provider is not linked to your account."},
                status=status.HTTP_404_NOT_FOUND,
            )

        with transaction.atomic():
            removed_emails = [
                ((acc.extra_data or {}).get("email") or "").strip()
                for acc in target_accounts
                if (acc.extra_data or {}).get("email")
            ]
            accounts.filter(provider=provider).delete()

            remaining_accounts = list(SocialAccount.objects.filter(user=request.user))
            remaining_emails = {
                ((acc.extra_data or {}).get("email") or "").strip().lower(): (
                    (acc.extra_data or {}).get("email") or ""
                ).strip()
                for acc in remaining_accounts
                if (acc.extra_data or {}).get("email")
            }

            for removed_email in removed_emails:
                if removed_email.lower() not in remaining_emails:
                    EmailAddress.objects.filter(
                        user=request.user, email__iexact=removed_email, primary=False
                    ).delete()

            current_email_lower = (request.user.email or "").strip().lower()
            if current_email_lower not in remaining_emails and remaining_emails:
                next_email = next(iter(remaining_emails.values()))
                EmailAddress.objects.filter(user=request.user, primary=True).update(primary=False)
                EmailAddress.objects.filter(
                    user=request.user, email__iexact=next_email
                ).update(primary=True)
                request.user.email = next_email
                request.user.save(update_fields=["email"])

        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)


class ProviderLinkStartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        provider = request.data.get("provider")
        mode = request.data.get("mode", "connect")
        next_url = request.data.get("next", "/settings")

        if provider not in SUPPORTED_PROVIDERS:
            return Response({"detail": "Unsupported provider."}, status=status.HTTP_400_BAD_REQUEST)
        if mode not in ("connect", "relink"):
            return Response({"detail": "Invalid link mode."}, status=status.HTTP_400_BAD_REQUEST)

        if not isinstance(next_url, str) or not next_url.startswith("/") or next_url.startswith("//"):
            next_url = "/settings"

        if (
            mode == "connect"
            and SocialAccount.objects.filter(user=request.user, provider=provider).exists()
        ):
            return Response(
                {"detail": "This provider is already connected. Use relink to switch accounts."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token = signing.dumps(
            {
                "user_id": request.user.id,
                "provider": provider,
                "mode": mode,
                "next": next_url,
            },
            salt=LINK_TOKEN_SALT,
        )
        return Response(
            {"path": f"/api/v1/auth/providers/connect/?token={quote(token)}"},
            status=status.HTTP_200_OK,
        )


class ProviderConnectRedirectView(View):
    def get(self, request: HttpRequest) -> HttpResponse:
        token = request.GET.get("token", "")
        try:
            payload = signing.loads(token, salt=LINK_TOKEN_SALT, max_age=LINK_TOKEN_MAX_AGE)
        except (signing.BadSignature, signing.SignatureExpired):
            return HttpResponseRedirect(f"{settings.FRONTEND_URL}/settings?link_error=expired")

        provider = payload.get("provider")
        if provider not in SUPPORTED_PROVIDERS:
            return HttpResponseRedirect(f"{settings.FRONTEND_URL}/settings?link_error=invalid")

        request.session["pending_social_link"] = payload
        request.session.modified = True
        request.session.save()

        next_url = payload.get("next") or "/settings"
        return HttpResponseRedirect(f"/accounts/{provider}/login/?next={quote(next_url)}")
