from typing import Any

from django.apps import apps
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand
from django.db.models import FileField


class Command(BaseCommand):
    help = "Scan Cloudflare R2 storage for orphaned media and test thumbnail cache, and purge them."

    def add_arguments(self, parser: Any) -> None:
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Simulate cleanup and print what would be deleted without modifying R2.",
        )
        parser.add_argument(
            "--no-input",
            action="store_true",
            help="Do not prompt for confirmation before deleting.",
        )

    def handle(self, *args: Any, **options: Any) -> None:
        dry_run = options["dry_run"]
        no_input = options["no_input"]

        bucket = getattr(default_storage, "bucket", None)
        if not bucket:
            self.stdout.write(
                self.style.ERROR(
                    "Cloudflare R2 bucket is not configured or default_storage is not R2Storage."
                )
            )
            return

        self.stdout.write("Scanning database for all active file references...")
        active_keys: set[str] = set()

        for model in apps.get_models():
            file_fields = [f.name for f in model._meta.get_fields() if isinstance(f, FileField)]
            if not file_fields:
                continue

            for obj in model.objects.all():
                for fname in file_fields:
                    ff = getattr(obj, fname, None)
                    if ff and getattr(ff, "name", None):
                        active_keys.add(ff.name)

        self.stdout.write(f"Found {len(active_keys)} active media file(s) in database.")

        valid_cache_prefixes: set[str] = set()
        for key in active_keys:
            name_without_ext = key.rsplit(".", 1)[0]
            valid_cache_prefixes.add(f"CACHE/images/{name_without_ext}")

        self.stdout.write("Scanning Cloudflare R2 bucket objects...")
        all_objects = list(bucket.objects.all())
        total_objects = len(all_objects)

        retained: list[tuple[str, str, int]] = []
        to_delete: list[tuple[str, str, int]] = []

        for obj in all_objects:
            key = obj.key
            size = getattr(obj, "size", 0) or 0
            if key in active_keys:
                retained.append((key, "active_media", size))
            elif key.startswith("CACHE/"):
                if any(key.startswith(p) for p in valid_cache_prefixes):
                    retained.append((key, "active_cache", size))
                else:
                    to_delete.append((key, "orphaned_cache", size))
            else:
                to_delete.append((key, "orphaned_media", size))

        total_bytes_freed = sum(s for _, _, s in to_delete)
        size_display = (
            f"{total_bytes_freed / 1024:.2f} KB"
            if total_bytes_freed < 1024 * 1024
            else f"{total_bytes_freed / (1024 * 1024):.2f} MB"
        )

        self.stdout.write("\nScan Results:")
        self.stdout.write(f"  Total objects in bucket: {total_objects}")
        self.stdout.write(
            f"  Retained objects:        {len(retained)} "
            f"({len([r for r in retained if r[1] == 'active_media'])} media, "
            f"{len([r for r in retained if r[1] == 'active_cache'])} cache)"
        )
        self.stdout.write(
            f"  Orphaned objects to delete: {len(to_delete)} "
            f"({len([d for d in to_delete if d[1] == 'orphaned_media'])} media, "
            f"{len([d for d in to_delete if d[1] == 'orphaned_cache'])} cache)"
        )
        self.stdout.write(f"  Space to reclaim:        {size_display}")

        if not to_delete:
            self.stdout.write(self.style.SUCCESS("\nBucket is already completely clean!"))
            return

        if dry_run:
            self.stdout.write(self.style.WARNING("\n[DRY-RUN] Files that would be deleted:"))
            for key, cat, size in to_delete:
                self.stdout.write(f"  - [{cat}] {key} ({size} B)")
            self.stdout.write(
                self.style.WARNING("\nDRY-RUN mode active. No files were deleted from R2.")
            )
            return

        if not no_input:
            prompt = (
                f"\nAre you sure you want to permanently delete "
                f"{len(to_delete)} objects from R2? [y/N]: "
            )
            confirm = input(prompt)
            if confirm.lower() not in ("y", "yes"):
                self.stdout.write("Cleanup aborted by user.")
                return

        self.stdout.write(f"\nDeleting {len(to_delete)} objects from Cloudflare R2...")

        # Batch delete in chunks of 1000 (S3 API limit)
        keys_to_delete = [k for k, _, _ in to_delete]
        chunk_size = 1000
        deleted_count = 0

        for i in range(0, len(keys_to_delete), chunk_size):
            chunk = keys_to_delete[i : i + chunk_size]
            delete_payload = {"Objects": [{"Key": k} for k in chunk], "Quiet": True}
            bucket.delete_objects(Delete=delete_payload)
            deleted_count += len(chunk)

        self.stdout.write(
            self.style.SUCCESS(
                f"\nSuccessfully purged {deleted_count} orphaned object(s) from Cloudflare R2. "
                f"Reclaimed {size_display}."
            )
        )
