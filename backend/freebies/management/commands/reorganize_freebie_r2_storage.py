import contextlib
import os
from typing import Any

from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand

from freebies.models import Freebie, freebie_image_upload_path


class Command(BaseCommand):
    help = "Reorganize legacy flat freebie images in R2 storage into convention-scoped subfolders."

    def add_arguments(self, parser: Any) -> None:
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be migrated without making changes to R2 or the database.",
        )

    def handle(self, *args: Any, **options: Any) -> None:
        dry_run = options["dry_run"]
        if dry_run:
            self.stdout.write(
                self.style.WARNING("Running in DRY-RUN mode. No changes will be applied.")
            )

        freebies_with_images = Freebie.objects.filter(image__isnull=False).exclude(image="")
        migrated_count = 0
        skipped_count = 0

        bucket = getattr(default_storage, "bucket", None)

        for freebie in freebies_with_images:
            current_name = freebie.image.name
            # Check if this is a legacy flat key: "freebies/{filename}" (exactly one slash)
            parts = current_name.split("/")
            if len(parts) != 2 or parts[0] != "freebies":
                skipped_count += 1
                continue

            filename = os.path.basename(current_name)
            target_path = freebie_image_upload_path(freebie, filename)

            if dry_run:
                self.stdout.write(
                    f"[DRY-RUN] Freebie #{freebie.id} ('{freebie.name}'):\n"
                    f"  {current_name} -> {target_path}"
                )
                migrated_count += 1
                continue

            if not default_storage.exists(current_name):
                self.stdout.write(
                    self.style.WARNING(
                        f"Skipping Freebie #{freebie.id}: "
                        f"'{current_name}' does not exist in storage."
                    )
                )
                skipped_count += 1
                continue

            try:
                # Read source and save to target in storage
                with default_storage.open(current_name, "rb") as source_file:
                    saved_path = default_storage.save(target_path, source_file)

                # Delete old original file
                default_storage.delete(current_name)

                # Purge old ImageKit cache thumbnails if on R2 bucket
                if bucket:
                    old_path_no_ext = current_name.rsplit(".", 1)[0]
                    old_cache_prefix = f"CACHE/images/{old_path_no_ext}"
                    with contextlib.suppress(Exception):
                        bucket.objects.filter(Prefix=old_cache_prefix).delete()

                # Update database record (suppressing pre_save deletion of the new file)
                freebie.image.name = saved_path
                freebie.save(update_fields=["image"])

                self.stdout.write(
                    self.style.SUCCESS(
                        f"Migrated Freebie #{freebie.id}: {current_name} -> {saved_path}"
                    )
                )
                migrated_count += 1
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f"Failed to migrate Freebie #{freebie.id} ({current_name}): {e}"
                    )
                )
                skipped_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"\nFinished. Migrated: {migrated_count}, "
                f"Skipped / Already organized: {skipped_count}"
            )
        )
