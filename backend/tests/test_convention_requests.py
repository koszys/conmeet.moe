import json
from datetime import date

import pytest
from conventions.admin import ConventionAdmin, ConventionRequestAdmin
from conventions.models import Convention, ConventionRequest
from django.contrib.admin.sites import AdminSite
from django.contrib.auth import get_user_model
from django.contrib.messages.storage.fallback import FallbackStorage
from django.test import Client, RequestFactory
from rest_framework import status
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db
User = get_user_model()


def _make_admin_request(factory_request):
    factory_request.session = "session"
    factory_request._messages = FallbackStorage(factory_request)
    return factory_request


def test_guest_can_submit_convention_request() -> None:
    payload = {
        "name": "Comic-Con Special Edition",
        "venue_name": "San Diego Convention Center",
        "city": "San Diego",
        "country": "USA",
        "starts_at": "2027-11-20",
        "ends_at": "2027-11-22",
        "website_url": "https://www.comic-con.org",
        "map_url": "https://maps.google.com/?q=San+Diego+Convention+Center",
        "notes": "Please add this con! Tickets go on sale next month.",
        "contact_email": "fan@example.com",
    }
    client = Client(HTTP_HOST="localhost")
    resp = client.post(
        "/api/v1/conventions/requests/",
        data=json.dumps(payload),
        content_type="application/json",
    )

    assert resp.status_code == status.HTTP_201_CREATED
    data = resp.json()
    assert data["name"] == "Comic-Con Special Edition"
    assert data["status"] == "pending"

    req = ConventionRequest.objects.get(pk=data["id"])
    assert req.submitted_by is None
    assert req.contact_email == "fan@example.com"
    assert req.notes == "Please add this con! Tickets go on sale next month."


def test_authenticated_user_request_links_user() -> None:
    user = User.objects.create_user(username="conlover", email="user@example.com", password="pw")
    client = APIClient()
    client.force_authenticate(user=user)

    payload = {
        "name": "MagiCon 2027",
        "starts_at": "2027-05-10",
        "ends_at": "2027-05-12",
        "venue_name": "Austin Convention Center",
        "city": "Austin",
        "country": "USA",
        "website_url": "https://magicon.example.com",
        "map_url": "https://maps.example.com/austin",
    }
    resp = client.post("/api/v1/conventions/requests/", payload)

    assert resp.status_code == status.HTTP_201_CREATED
    data = resp.json()
    req = ConventionRequest.objects.get(pk=data["id"])
    assert req.submitted_by == user
    assert req.venue_name == "Austin Convention Center"
    assert req.city == "Austin"
    assert req.country == "USA"


def test_convention_request_urls_required() -> None:
    client = Client(HTTP_HOST="localhost")
    payload = {
        "name": "Missing Links Con",
        "venue_name": "Seattle Center",
        "city": "Seattle",
        "country": "USA",
        "starts_at": "2027-05-10",
        "ends_at": "2027-05-12",
    }
    resp = client.post(
        "/api/v1/conventions/requests/",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    errors = resp.json()
    assert "website_url" in errors
    assert "map_url" in errors


def test_convention_request_location_fields_required() -> None:
    client = Client(HTTP_HOST="localhost")
    payload = {
        "name": "No Location Con",
        "starts_at": "2027-05-10",
        "ends_at": "2027-05-12",
        "website_url": "https://nolocation.example.com",
        "map_url": "https://maps.example.com/nolocation",
    }
    resp = client.post(
        "/api/v1/conventions/requests/",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    errors = resp.json()
    assert "venue_name" in errors
    assert "city" in errors
    assert "country" in errors


def test_convention_request_date_validation() -> None:
    client = Client(HTTP_HOST="localhost")
    payload = {
        "name": "Time Travel Con",
        "venue_name": "McCormick Place",
        "city": "Chicago",
        "country": "USA",
        "starts_at": "2027-06-10",
        "ends_at": "2027-06-05",  # invalid: ends before starts
        "website_url": "https://timetravel.example.com",
        "map_url": "https://maps.example.com/timetravel",
    }
    resp = client.post(
        "/api/v1/conventions/requests/",
        data=json.dumps(payload),
        content_type="application/json",
    )

    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "ends_at" in resp.json()


def test_admin_initial_data_prefilled_from_request() -> None:
    req = ConventionRequest.objects.create(
        name="Kyoto Anime Festival 2027",
        venue_name="Miyako Messe",
        city="Kyoto",
        country="Japan",
        starts_at=date(2027, 9, 15),
        ends_at=date(2027, 9, 17),
        website_url="https://kyoto-anime.jp",
        map_url="https://maps.example.com/miyako",
        notes="Official event link included",
    )

    factory = RequestFactory()
    request = _make_admin_request(
        factory.get(f"/admin/conventions/convention/add/?from_request={req.id}")
    )
    site = AdminSite()
    con_admin = ConventionAdmin(Convention, site)

    initial = con_admin.get_changeform_initial_data(request)
    assert initial["name"] == "Kyoto Anime Festival 2027"
    assert initial["slug"] == "kyoto-anime-festival-2027"
    assert initial["venue_name"] == "Miyako Messe"
    assert initial["city"] == "Kyoto"
    assert initial["country"] == "Japan"
    assert initial["starts_at"] == date(2027, 9, 15)
    assert initial["ends_at"] == date(2027, 9, 17)
    assert initial["website_url"] == "https://kyoto-anime.jp"
    assert initial["map_url"] == "https://maps.example.com/miyako"


def test_admin_save_model_auto_approves_request() -> None:
    req = ConventionRequest.objects.create(
        name="Denver Pop Expo 2027",
        starts_at=date(2027, 8, 1),
        ends_at=date(2027, 8, 3),
        city="Denver",
    )

    factory = RequestFactory()
    request = _make_admin_request(
        factory.post(f"/admin/conventions/convention/add/?from_request={req.id}")
    )
    site = AdminSite()
    con_admin = ConventionAdmin(Convention, site)

    con = Convention(
        name="Denver Pop Expo 2027",
        slug="denver-pop-expo-2027",
        city="Denver",
        starts_at=date(2027, 8, 1),
        ends_at=date(2027, 8, 3),
    )
    con_admin.save_model(request, con, None, change=False)

    req.refresh_from_db()
    assert req.status == ConventionRequest.STATUS_APPROVED
    assert req.created_convention == con


def test_admin_quick_approve_selected_requests() -> None:
    req1 = ConventionRequest.objects.create(
        name="Batch Con One",
        starts_at=date(2027, 1, 1),
        ends_at=date(2027, 1, 3),
    )
    req2 = ConventionRequest.objects.create(
        name="Batch Con Two",
        starts_at=date(2027, 2, 1),
        ends_at=date(2027, 2, 3),
    )

    site = AdminSite()
    req_admin = ConventionRequestAdmin(ConventionRequest, site)
    factory = RequestFactory()
    request = _make_admin_request(factory.post("/admin/conventions/conventionrequest/"))

    queryset = ConventionRequest.objects.filter(id__in=[req1.id, req2.id])
    req_admin.approve_selected_requests(request, queryset)

    req1.refresh_from_db()
    req2.refresh_from_db()
    assert req1.status == ConventionRequest.STATUS_APPROVED
    assert req2.status == ConventionRequest.STATUS_APPROVED
    assert req1.created_convention.name == "Batch Con One"
    assert req2.created_convention.name == "Batch Con Two"
