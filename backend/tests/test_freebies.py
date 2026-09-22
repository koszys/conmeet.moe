from datetime import date, timedelta
from typing import Any

import pytest
from conventions.models import Convention
from django.contrib.auth import get_user_model
from freebies.models import Freebie, UserFreebie, Vendor
from rest_framework import status
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


def _authed_client(user: Any) -> APIClient:
    client = APIClient()
    client.force_authenticate(user=user)
    return client


def _make_con(name: str = "Anime NYC", slug: str = "anime-nyc") -> Convention:
    today = date.today()
    return Convention.objects.create(
        name=name,
        slug=slug,
        city="New York",
        country="USA",
        starts_at=today + timedelta(days=10),
        ends_at=today + timedelta(days=13),
    )


def _make_freebie(
    name: str = "Hoyo Sticker Pack",
    vendor_name: str = "HoYoverse",
    con: Convention | None = None,
    location: str = "Booth #100",
    requirements: str = "Follow on X",
    created_by: Any = None,
) -> Freebie:
    vendor, _ = Vendor.objects.get_or_create(name=vendor_name)
    return Freebie.objects.create(
        name=name,
        vendor=vendor,
        convention=con,
        location=location,
        requirements=requirements,
        created_by=created_by,
    )


def test_list_freebies_public() -> None:
    con = _make_con()
    freebie = _make_freebie(con=con)

    client = APIClient()
    resp = client.get("/api/v1/freebies/")

    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert len(data) == 1
    item = data[0]
    assert item["id"] == freebie.id
    assert item["name"] == "Hoyo Sticker Pack"
    assert item["vendor"]["name"] == "HoYoverse"
    assert item["convention_slug"] == "anime-nyc"
    assert item["is_saved"] is False
    assert item["is_claimed"] is False
    assert item["save_count"] == 0


def test_filter_freebies_by_convention() -> None:
    con1 = _make_con("Anime NYC", "anime-nyc")
    con2 = _make_con("Anime Expo", "anime-expo")

    _make_freebie(name="NYC Swag", con=con1)
    _make_freebie(name="AX Swag", con=con2)

    client = APIClient()
    resp = client.get("/api/v1/freebies/?convention=anime-nyc")

    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert len(data) == 1
    assert data[0]["name"] == "NYC Swag"


def test_search_freebies() -> None:
    con = _make_con()
    _make_freebie(name="Special Poster", vendor_name="Kadokawa", con=con, location="Booth 500")
    _make_freebie(name="Keycap", vendor_name="Akko", con=con, location="Booth 800")

    client = APIClient()

    # Search by vendor
    resp = client.get("/api/v1/freebies/?q=kadokawa")
    assert resp.status_code == status.HTTP_200_OK
    assert len(resp.json()) == 1
    assert resp.json()[0]["name"] == "Special Poster"

    # Search by location
    resp = client.get("/api/v1/freebies/?q=800")
    assert resp.status_code == status.HTTP_200_OK
    assert len(resp.json()) == 1
    assert resp.json()[0]["name"] == "Keycap"


def test_create_freebie_authenticated() -> None:
    user = get_user_model().objects.create_user(username="miku", display_name="Hatsune Miku")
    con = _make_con("Anime NYC", "anime-nyc")

    client = _authed_client(user)
    payload = {
        "name": "Miku Lanyard",
        "vendor_name": "Crypton",
        "convention_slug": "anime-nyc",
        "location": "Booth 3939",
        "requirements": "Show cosplay",
    }
    resp = client.post("/api/v1/freebies/", payload)

    assert resp.status_code == status.HTTP_201_CREATED
    data = resp.json()
    assert data["name"] == "Miku Lanyard"
    assert data["vendor"]["name"] == "Crypton"
    assert data["convention_slug"] == "anime-nyc"
    assert data["created_by_name"] == "Hatsune Miku"

    freebie = Freebie.objects.get(id=data["id"])
    assert freebie.created_by == user


def test_create_freebie_unauthenticated_fails() -> None:
    client = APIClient()
    resp = client.post(
        "/api/v1/freebies/",
        {"name": "Bad Swag", "vendor_name": "Anon"},
    )
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED


def test_toggle_save() -> None:
    user = get_user_model().objects.create_user(username="ren")
    freebie = _make_freebie()

    client = _authed_client(user)

    # First toggle: save
    resp1 = client.post(f"/api/v1/freebies/{freebie.id}/save/")
    assert resp1.status_code == status.HTTP_200_OK
    assert resp1.json() == {"is_saved": True, "save_count": 1}
    assert UserFreebie.objects.filter(user=user, freebie=freebie).exists()

    # Second toggle: unsave
    resp2 = client.post(f"/api/v1/freebies/{freebie.id}/save/")
    assert resp2.status_code == status.HTTP_200_OK
    assert resp2.json() == {"is_saved": False, "save_count": 0}
    assert not UserFreebie.objects.filter(user=user, freebie=freebie).exists()


def test_toggle_claim() -> None:
    user = get_user_model().objects.create_user(username="len")
    freebie = _make_freebie()

    client = _authed_client(user)

    # First claim: claim = True
    resp1 = client.post(f"/api/v1/freebies/{freebie.id}/claim/")
    assert resp1.status_code == status.HTTP_200_OK
    data1 = resp1.json()
    assert data1["is_claimed"] is True
    assert data1["claimed_at"] is not None

    uf = UserFreebie.objects.get(user=user, freebie=freebie)
    assert uf.claimed is True

    # Second claim: claim = False
    resp2 = client.post(f"/api/v1/freebies/{freebie.id}/claim/")
    assert resp2.status_code == status.HTTP_200_OK
    data2 = resp2.json()
    assert data2["is_claimed"] is False
    assert data2["claimed_at"] is None


def test_filter_saved_and_unclaimed() -> None:
    user = get_user_model().objects.create_user(username="kaito")
    con = _make_con()
    f1 = _make_freebie("Swag 1", con=con)
    f2 = _make_freebie("Swag 2", con=con)
    _make_freebie("Swag 3 (unsaved)", con=con)

    # User saves f1 and f2; claims f2
    UserFreebie.objects.create(user=user, freebie=f1, claimed=False)
    UserFreebie.objects.create(user=user, freebie=f2, claimed=True)

    client = _authed_client(user)

    # Saved filter returns f1 and f2
    resp_saved = client.get(f"/api/v1/freebies/?convention={con.slug}&saved=true")
    assert resp_saved.status_code == status.HTTP_200_OK
    assert {x["name"] for x in resp_saved.json()} == {"Swag 1", "Swag 2"}

    # Unclaimed filter returns only f1
    resp_unclaimed = client.get(f"/api/v1/freebies/?convention={con.slug}&unclaimed=true")
    assert resp_unclaimed.status_code == status.HTTP_200_OK
    assert [x["name"] for x in resp_unclaimed.json()] == ["Swag 1"]

    # Claimed filter returns only f2
    resp_claimed = client.get(f"/api/v1/freebies/?convention={con.slug}&claimed=true")
    assert resp_claimed.status_code == status.HTTP_200_OK
    assert [x["name"] for x in resp_claimed.json()] == ["Swag 2"]


def test_vendor_list_filtered_by_convention() -> None:
    con1 = _make_con("Anime NYC", "anime-nyc")
    con2 = _make_con("Anime Expo", "anime-expo")

    _make_freebie("Item 1", vendor_name="GoodSmile", con=con1)
    _make_freebie("Item 2", vendor_name="Aniplex", con=con2)

    client = APIClient()

    # All vendors
    resp_all = client.get("/api/v1/vendors/")
    assert resp_all.status_code == status.HTTP_200_OK
    assert {v["name"] for v in resp_all.json()} == {"GoodSmile", "Aniplex"}

    # Filtered by con1
    resp_con1 = client.get("/api/v1/vendors/?convention=anime-nyc")
    assert resp_con1.status_code == status.HTTP_200_OK
    assert [v["name"] for v in resp_con1.json()] == ["GoodSmile"]
