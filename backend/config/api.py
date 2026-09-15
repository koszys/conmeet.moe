"""API v1 URL patterns (aggregated so config/urls.py stays tiny)."""

from django.urls import path

from accounts.views import health

urlpatterns = [
    path("health/", health, name="health"),
]