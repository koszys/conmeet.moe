"""API v1 URL patterns (aggregated so config/urls.py stays tiny)."""

from accounts.views import LogoutView, MeView, health
from conventions.views import (
    ConventionDetailView,
    ConventionListView,
    ConventionRequestCreateView,
)
from django.urls import path
from freebies.views import (
    FreebieClaimToggleView,
    FreebieDetailView,
    FreebieListCreateView,
    FreebieSaveToggleView,
    VendorListView,
)
from meetups.views import (
    AlbumDetailView,
    AlbumFavoriteToggleView,
    AlbumLikeToggleView,
    ConventionMeetupListCreateView,
    MeetupAlbumListCreateView,
    MeetupDetailView,
    MeetupGoingToggleView,
    MeetupSaveToggleView,
    PhotoLikeToggleView,
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("health/", health, name="health"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("conventions/", ConventionListView.as_view(), name="convention-list"),
    path(
        "conventions/requests/",
        ConventionRequestCreateView.as_view(),
        name="convention-request-create",
    ),
    path("conventions/<slug:slug>/", ConventionDetailView.as_view(), name="convention-detail"),
    path(
        "conventions/<slug:slug>/meetups/",
        ConventionMeetupListCreateView.as_view(),
        name="convention-meetup-list",
    ),
    path("meetups/<str:pk>/", MeetupDetailView.as_view(), name="meetup-detail"),
    path("meetups/<str:pk>/save/", MeetupSaveToggleView.as_view(), name="meetup-save"),
    path("meetups/<str:pk>/going/", MeetupGoingToggleView.as_view(), name="meetup-going"),
    path(
        "meetups/<str:meetup_id>/albums/",
        MeetupAlbumListCreateView.as_view(),
        name="meetup-album-list",
    ),
    path("albums/<int:pk>/", AlbumDetailView.as_view(), name="album-detail"),
    path("albums/<int:pk>/like/", AlbumLikeToggleView.as_view(), name="album-like"),
    path("albums/<int:pk>/favorite/", AlbumFavoriteToggleView.as_view(), name="album-favorite"),
    path("photos/<int:pk>/like/", PhotoLikeToggleView.as_view(), name="photo-like"),
    path("freebies/", FreebieListCreateView.as_view(), name="freebie-list"),
    path("freebies/<int:pk>/", FreebieDetailView.as_view(), name="freebie-detail"),
    path("freebies/<int:pk>/save/", FreebieSaveToggleView.as_view(), name="freebie-save"),
    path("freebies/<int:pk>/claim/", FreebieClaimToggleView.as_view(), name="freebie-claim"),
    path("vendors/", VendorListView.as_view(), name="vendor-list"),
]
