import pytest
from django.test import Client

pytestmark = pytest.mark.django_db


def test_health() -> None:
    resp = Client().get("/api/v1/health/")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}
