from datetime import date, timedelta

from django.core.management.base import BaseCommand

from conventions.models import Convention

# Real conventions. Dates are offset from today so the line-up shows the
# full phase spread (happening now / soon / coming up) while developing.
CONVENTIONS: list[dict[str, object]] = [
    {
        "slug": "anime-expo-2027",
        "name": "Anime Expo",
        "venue_name": "Los Angeles Convention Center",
        "city": "Los Angeles",
        "country": "United States",
        "offset": 0,
        "duration": 4,
        "is_featured": True,
        "is_active": True,
        "website_url": "https://www.anime-expo.org",
    },
    {
        "slug": "sakura-con",
        "name": "Sakura-Con",
        "venue_name": "Seattle Convention Center",
        "city": "Seattle",
        "country": "United States",
        "offset": 12,
        "duration": 3,
        "is_featured": False,
        "is_active": True,
        "website_url": "https://sakuracon.org",
    },
    {
        "slug": "anime-boston",
        "name": "Anime Boston",
        "venue_name": "Hynes Convention Center",
        "city": "Boston",
        "country": "United States",
        "offset": 45,
        "duration": 3,
        "is_featured": False,
        "is_active": True,
        "website_url": "https://www.animeboston.com",
    },
    {
        "slug": "otakon",
        "name": "Otakon",
        "venue_name": "Walter E. Washington Convention Center",
        "city": "Washington, D.C.",
        "country": "United States",
        "offset": 90,
        "duration": 3,
        "is_featured": False,
        "is_active": True,
        "website_url": "https://www.otakon.com",
    },
    {
        "slug": "anime-nyc-2026",
        "name": "Anime NYC",
        "venue_name": "Javits Center",
        "city": "New York",
        "country": "United States",
        "offset": -30,
        "duration": 3,
        "is_featured": False,
        "is_active": True,
        "website_url": "https://animenyc.com",
    },
]


class Command(BaseCommand):
    help = "Seed conventions so the line-up has data to display."

    def handle(self, *args: object, **options: object) -> None:
        created = 0
        updated = 0

        for item in CONVENTIONS:
            slug: str = item["slug"]
            offset: int | None = item["offset"]
            duration: int = item["duration"]

            starts_at = date.today() + timedelta(days=offset or 0)
            ends_at = starts_at + timedelta(days=duration - 1)

            query = {k: v for k, v in item.items() if k not in {"offset", "duration"}}
            defaults = {**query, "starts_at": starts_at, "ends_at": ends_at}
            defaults.pop("slug", None)

            convention, was_created = Convention.objects.update_or_create(
                slug=slug,
                defaults=defaults,
            )
            created += was_created
            updated += not was_created
            self.stdout.write(f"  {'created' if was_created else 'updated'} {convention.name} ({convention.starts_at} → {convention.ends_at})")

        self.stdout.write(
            self.style.SUCCESS(f"Done — {created} created, {updated} updated.")
        )