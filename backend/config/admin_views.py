"""Admin views for Cloudflare R2 storage inspection and media selection."""

import os
from pathlib import Path
from typing import Any

from django.conf import settings
from django.core.files.storage import default_storage
from django.http import HttpRequest, JsonResponse

ALLOWED_IMAGE_EXTENSIONS = (
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".svg",
    ".avif",
)


def _format_size(size_bytes: int) -> str:
    """Format bytes into a human-readable string (KB, MB)."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    if size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    return f"{size_bytes / (1024 * 1024):.1f} MB"


def _list_r2_images(folder: str, search: str) -> tuple[list[dict[str, Any]], list[str]]:
    """List images from Cloudflare R2 via bucket.objects."""
    bucket = getattr(default_storage, "bucket", None)
    if not bucket:
        return [], []

    images: list[dict[str, Any]] = []
    folders: set[str] = set()

    # If folder is specified, we can filter by Prefix to narrow down results
    prefix_filter = f"{folder.strip('/')}/" if folder else ""
    try:
        if prefix_filter:
            objects = bucket.objects.filter(Prefix=prefix_filter)
        else:
            objects = bucket.objects.all()
    except Exception:
        return [], []

    for obj in objects:
        key = obj.key
        # Skip ImageKit cache thumbnails and hidden/test files
        if key.startswith("CACHE/") or "/CACHE/" in key or key.startswith("_"):
            continue
        if not key.lower().endswith(ALLOWED_IMAGE_EXTENSIONS):
            continue

        parts = key.rsplit("/", 1)
        item_folder = parts[0] if len(parts) > 1 else ""
        filename = parts[-1]

        if item_folder:
            folders.add(item_folder)

        # Apply search filter
        if search and search.lower() not in filename.lower() and search.lower() not in key.lower():
            continue

        last_mod = (
            obj.last_modified.isoformat()
            if hasattr(obj, "last_modified") and obj.last_modified
            else None
        )
        url = default_storage.url(key)

        images.append(
            {
                "key": key,
                "name": filename,
                "folder": item_folder,
                "url": url,
                "size": obj.size,
                "size_display": _format_size(obj.size),
                "last_modified": last_mod,
            }
        )

    # Sort newest first if timestamp exists, otherwise alphabetically by key
    images.sort(key=lambda x: x.get("last_modified") or x["key"], reverse=True)
    return images, sorted(folders)


def _list_local_images(folder: str, search: str) -> tuple[list[dict[str, Any]], list[str]]:
    """Fallback: list images from local media root when FileSystemStorage is used."""
    media_root = Path(settings.MEDIA_ROOT)
    if not media_root.exists():
        return [], []

    images: list[dict[str, Any]] = []
    folders: set[str] = set()

    for root, _, files in os.walk(media_root):
        rel_dir = os.path.relpath(root, media_root)
        if rel_dir == ".":
            rel_dir = ""

        # Skip cache directory
        if rel_dir.startswith("CACHE") or "/CACHE" in rel_dir:
            continue

        if rel_dir:
            folders.add(rel_dir)

        if folder and rel_dir != folder.strip("/"):
            continue

        for filename in files:
            if filename.startswith("_") or not filename.lower().endswith(ALLOWED_IMAGE_EXTENSIONS):
                continue

            if search and search.lower() not in filename.lower():
                continue

            file_path = Path(root) / filename
            key = f"{rel_dir}/{filename}" if rel_dir else filename
            stat = file_path.stat()
            url = default_storage.url(key)

            images.append(
                {
                    "key": key,
                    "name": filename,
                    "folder": rel_dir,
                    "url": url,
                    "size": stat.st_size,
                    "size_display": _format_size(stat.st_size),
                    "last_modified": None,
                }
            )

    images.sort(key=lambda x: x["name"])
    return images, sorted(folders)


def r2_image_list_view(request: HttpRequest) -> JsonResponse:
    """
    JSON API endpoint for Django Admin R2 image picker.
    Requires staff authentication.
    """
    if not request.user.is_authenticated or not getattr(request.user, "is_staff", False):
        return JsonResponse({"error": "Forbidden: Staff authentication required."}, status=403)

    folder = request.GET.get("folder", "").strip()
    search = request.GET.get("search", "").strip()

    if hasattr(default_storage, "bucket") and default_storage.bucket is not None:
        images, folders = _list_r2_images(folder, search)
    else:
        images, folders = _list_local_images(folder, search)

    return JsonResponse(
        {
            "images": images,
            "folders": folders,
            "total": len(images),
        }
    )
