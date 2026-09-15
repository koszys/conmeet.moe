"""Root URL configuration."""

from django.contrib import admin
from django.urls import include, path

import config.api as api_v1

urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/", include("allauth.urls")),
    path("api/v1/", include(api_v1)),
]
