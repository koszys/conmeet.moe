"""API v1 URL patterns (aggregated so config/urls.py stays tiny)."""

from accounts.views import LogoutView, MeView, health
from conventions.views import ConventionDetailView, ConventionListView
from django.urls import path
from freebies.views import (
    FreebieClaimToggleView,
    FreebieDetailView,
    FreebieListCreateView,
    FreebieSaveToggleView,
    VendorListView,
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("health/", health, name="health"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("conventions/", ConventionListView.as_view(), name="convention-list"),
    path("conventions/<slug:slug>/", ConventionDetailView.as_view(), name="convention-detail"),
    path("freebies/", FreebieListCreateView.as_view(), name="freebie-list"),
    path("freebies/<int:pk>/", FreebieDetailView.as_view(), name="freebie-detail"),
    path("freebies/<int:pk>/save/", FreebieSaveToggleView.as_view(), name="freebie-save"),
    path("freebies/<int:pk>/claim/", FreebieClaimToggleView.as_view(), name="freebie-claim"),
    path("vendors/", VendorListView.as_view(), name="vendor-list"),
]
