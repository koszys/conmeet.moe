from io import BytesIO

import pytest
from conventions.models import Convention
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from freebies.models import Freebie, FreebieSetting, Vendor
from PIL import Image
from rest_framework import status
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db
User = get_user_model()


def _create_test_image(name: str = "freebie.webp") -> SimpleUploadedFile:
    img = Image.new("RGB", (100, 100), color="green")
    buf = BytesIO()
    img.save(buf, format="WEBP")
    return SimpleUploadedFile(name, buf.getvalue(), content_type="image/webp")


@pytest.fixture
def convention() -> Convention:
    return Convention.objects.create(
        name="Anime Matsuri 2027",
        slug="anime-matsuri-2027",
        starts_at="2027-08-01",
        ends_at="2027-08-03",
    )


@pytest.fixture
def regular_user() -> User:
    return User.objects.create_user(
        username="collector1", email="collector@example.com", password="password123"
    )


@pytest.fixture
def staff_user() -> User:
    return User.objects.create_user(
        username="modadmin", email="mod@example.com", password="password123", is_staff=True
    )


@pytest.fixture
def vendor() -> Vendor:
    return Vendor.objects.create(name="GoodSmile")


@pytest.fixture
def auth_client(regular_user: User) -> APIClient:
    client = APIClient()
    client.force_authenticate(user=regular_user)
    return client


@pytest.fixture
def staff_client(staff_user: User) -> APIClient:
    client = APIClient()
    client.force_authenticate(user=staff_user)
    return client


def test_freebie_settings_endpoint():
    client = APIClient()
    resp = client.get("/api/v1/freebies/settings/")
    assert resp.status_code == status.HTTP_200_OK
    assert "unmount_all_freebies" in resp.json()
    assert resp.json()["unmount_all_freebies"] is False


def test_specific_freebie_unmount(
    auth_client: APIClient, staff_client: APIClient, convention: Convention, vendor: Vendor
):
    freebie_good = Freebie.objects.create(
        name="Cool Sticker", convention=convention, vendor=vendor
    )
    freebie_bad = Freebie.objects.create(
        name="Scam Token", convention=convention, vendor=vendor, unmount_freebie=True
    )

    # Public list contains only good freebie
    resp = auth_client.get(f"/api/v1/freebies/?convention={convention.slug}")
    assert resp.status_code == status.HTTP_200_OK
    names = [f["name"] for f in resp.json()]
    assert "Cool Sticker" in names
    assert "Scam Token" not in names

    # Direct fetch of bad freebie returns 404
    assert (
        auth_client.get(f"/api/v1/freebies/{freebie_bad.id}/").status_code
        == status.HTTP_404_NOT_FOUND
    )

    # Save and claim return 404
    assert (
        auth_client.post(f"/api/v1/freebies/{freebie_bad.id}/save/").status_code
        == status.HTTP_404_NOT_FOUND
    )
    assert (
        auth_client.post(f"/api/v1/freebies/{freebie_bad.id}/claim/").status_code
        == status.HTTP_404_NOT_FOUND
    )

    # Staff can still view it
    assert staff_client.get(f"/api/v1/freebies/{freebie_bad.id}/").status_code == status.HTTP_200_OK


def test_convention_level_freebie_unmount(
    auth_client: APIClient, convention: Convention, vendor: Vendor
):
    con2 = Convention.objects.create(
        name="Other Con", slug="other-con", starts_at="2027-09-01", ends_at="2027-09-03"
    )
    Freebie.objects.create(name="Sticker 1", convention=convention, vendor=vendor)
    Freebie.objects.create(name="Sticker 2", convention=con2, vendor=vendor)

    # Unmount freebies on convention 1
    convention.unmount_freebies = True
    convention.save()

    # GET returns []
    resp = auth_client.get(f"/api/v1/freebies/?convention={convention.slug}")
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json() == []

    # POST returns 403 Forbidden
    img = _create_test_image()
    post_resp = auth_client.post(
        "/api/v1/freebies/",
        {
            "name": "Badge",
            "vendor_name": "GoodSmile",
            "convention_slug": convention.slug,
            "image": img,
        },
        format="multipart",
    )
    assert post_resp.status_code == status.HTTP_403_FORBIDDEN

    # Other con is unaffected
    resp2 = auth_client.get(f"/api/v1/freebies/?convention={con2.slug}")
    assert resp2.status_code == status.HTTP_200_OK
    assert len(resp2.json()) == 1


def test_sitewide_freebie_unmount(auth_client: APIClient, convention: Convention, vendor: Vendor):
    Freebie.objects.create(name="Sticker 1", convention=convention, vendor=vendor)

    setting = FreebieSetting.get_settings()
    setting.unmount_all_freebies = True
    setting.save()

    # All lists return []
    resp = auth_client.get(f"/api/v1/freebies/?convention={convention.slug}")
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json() == []

    # POST returns 403
    img = _create_test_image()
    post_resp = auth_client.post(
        "/api/v1/freebies/",
        {
            "name": "Badge",
            "vendor_name": "GoodSmile",
            "convention_slug": convention.slug,
            "image": img,
        },
        format="multipart",
    )
    assert post_resp.status_code == status.HTTP_403_FORBIDDEN
