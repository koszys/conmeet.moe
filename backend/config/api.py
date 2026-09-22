"""API v1 URL patterns (aggregated so config/urls.py stays tiny)."""

from accounts.views import LogoutView, MeView, health
from conventions.views import ConventionDetailView, ConventionListView
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("health/", health, name="health"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("conventions/", ConventionListView.as_view(), name="convention-list"),
    path("conventions/<slug:slug>/", ConventionDetailView.as_view(), name="convention-detail"),
]
