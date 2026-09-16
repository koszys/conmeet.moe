import json
from datetime import date, timedelta

import pytest
from conventions.models import Convention
from django.test import Client
from rest_framework import status

pytestmark = pytest.mark.django_db

LIST_FIELDS = {
    "id",
    "name",
    "slug",
    "venue_name",
    "city",
    "country",
    "starts_at",
    "ends_at",
    "website_url",
    "banner",
    "banner_thumb",
    "is_featured",
}
DETAIL_FIELDS = LIST_FIELDS | {"description", "map_url"}


def _make_convention(
    name: str,
    *,
    slug: str | None = None,
    starts_at: date | None = None,
    is_active: bool = True,
) -> Convention:
    today = date.today()
    return Convention.objects.create(
        name=name,
        slug=slug or name.lower().replace(" ", "-"),
        city="New York",
        country="USA",
        starts_at=starts_at or today + timedelta(days=30),
        ends_at=(starts_at or today + timedelta(days=30)) + timedelta(days=3),
        website_url=f"https://example.com/{slug or name}",
        is_active=is_active,
    )


def test_convention_list_returns_only_active_ordered_by_start() -> None:
    _make_convention("Zeta Con", starts_at=date.today() + timedelta(days=60))
    _make_convention("Alpha Con", starts_at=date.today() + timedelta(days=10))
    _make_convention("Hidden Con", starts_at=date.today() + timedelta(days=20), is_active=False)

    resp = Client(HTTP_HOST="localhost").get("/api/v1/conventions/")

    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert [row["name"] for row in data] == ["Alpha Con", "Zeta Con"]
    assert set(data[0]) == LIST_FIELDS


def test_convention_list_works_for_guests() -> None:
    _make_convention("Public Con")

    resp = Client(HTTP_HOST="localhost").get("/api/v1/conventions/")

    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()[0]["name"] == "Public Con"


def test_convention_detail_returns_full_fields_by_slug() -> None:
    con = _make_convention("Anime NYC", slug="anime-nyc")
    con.description = json.dumps(
        {"delta": [{"insert": "Big con!"}], "html": "<p>Big con!</p>"}
    )
    con.map_url = "https://maps.example.com/anime-nyc"
    con.save()

    resp = Client(HTTP_HOST="localhost").get("/api/v1/conventions/anime-nyc/")

    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert set(data) == DETAIL_FIELDS
    assert data["name"] == "Anime NYC"
    assert data["slug"] == con.slug
    assert data["description"] == "<p>Big con!</p>"
    assert data["map_url"] == "https://maps.example.com/anime-nyc"


def test_convention_detail_404_for_unknown_slug() -> None:
    resp = Client(HTTP_HOST="localhost").get("/api/v1/conventions/does-not-exist/")

    assert resp.status_code == status.HTTP_404_NOT_FOUND


def test_convention_detail_hides_inactive() -> None:
    _make_convention("Gone Con", slug="gone-con", is_active=False)

    resp = Client(HTTP_HOST="localhost").get("/api/v1/conventions/gone-con/")

    assert resp.status_code == status.HTTP_404_NOT_FOUND


def test_convention_dates_serialize_as_iso() -> None:
    _make_convention("Date Con", starts_at=date(2026, 10, 1))

    resp = Client(HTTP_HOST="localhost").get("/api/v1/conventions/")

    assert resp.json()[0]["starts_at"] == "2026-10-01"
