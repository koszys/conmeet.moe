import os

from allauth.socialaccount.models import SocialApp
from django.conf import settings
from django.contrib.sites.models import Site
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Provision allauth SocialApp records from environment variables."

    def handle(self, *args: object, **options: object) -> None:
        site, _ = Site.objects.get_or_create(
            id=settings.SITE_ID,
            defaults={"domain": "localhost", "name": "localhost"},
        )
        if site.domain in {"", "example.com"}:
            site.domain = "localhost"
            site.name = "localhost"
            site.save(update_fields=("domain", "name"))

        providers = [
            (
                "discord",
                "Discord",
                os.environ.get("DISCORD_CLIENT_ID", "").strip(),
                os.environ.get("DISCORD_CLIENT_SECRET", "").strip(),
            ),
            (
                "google",
                "Google",
                os.environ.get("GOOGLE_CLIENT_ID", "").strip(),
                os.environ.get("GOOGLE_CLIENT_SECRET", "").strip(),
            ),
        ]

        for provider, label, client_id, secret in providers:
            if not (client_id and secret):
                self.stdout.write(
                    self.style.WARNING(f"Skipped {label}: credentials not set in env")
                )
                continue
            app, created = SocialApp.objects.update_or_create(
                provider=provider,
                defaults={"name": label, "client_id": client_id, "secret": secret},
            )
            if site not in app.sites.all():
                app.sites.add(site)
            action = "Created" if created else "Updated"
            self.stdout.write(
                self.style.SUCCESS(f"{action} {label} SocialApp → site {site.domain}")
            )
