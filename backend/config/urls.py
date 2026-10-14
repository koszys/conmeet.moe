"""Root URL configuration."""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

import config.api as api_v1
from config.admin_views import r2_image_list_view

urlpatterns = [
    path("admin/r2-images/", r2_image_list_view, name="admin_r2_images"),
    path("admin/", admin.site.urls),
    path("accounts/", include("allauth.urls")),
    path("api/v1/", include(api_v1)),
]

if settings.DEBUG and not settings.AWS_ACCESS_KEY_ID:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

