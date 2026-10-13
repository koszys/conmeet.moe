"""Management command to test and verify Cloudflare R2 storage connectivity."""

import uuid

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Verifies Cloudflare R2 bucket connectivity, permissions, and public URL generation."

    def handle(self, *args: object, **options: object) -> None:
        if not getattr(settings, "AWS_ACCESS_KEY_ID", None):
            self.stdout.write(
                self.style.WARNING(
                    "R2_ACCESS_KEY_ID is not configured. "
                    "Default storage is currently using FileSystemStorage."
                )
            )
            return

        self.stdout.write("Testing Cloudflare R2 storage connectivity...")
        test_filename = f"_r2_test_{uuid.uuid4().hex[:8]}.txt"
        test_content = b"conmeet.moe R2 health check"

        try:
            saved_name = default_storage.save(test_filename, ContentFile(test_content))
            self.stdout.write(self.style.SUCCESS(f"[OK] Upload succeeded: {saved_name}"))

            if not default_storage.exists(saved_name):
                raise AssertionError("File reported as missing after save")
            self.stdout.write(self.style.SUCCESS("[OK] File existence verified"))

            with default_storage.open(saved_name) as f:
                content = f.read()
            if content != test_content:
                raise AssertionError("Content mismatch: read-back content does not match original")
            self.stdout.write(self.style.SUCCESS("[OK] File read-back verified"))

            public_url = default_storage.url(saved_name)
            self.stdout.write(self.style.SUCCESS(f"[OK] Public URL generated: {public_url}"))

            default_storage.delete(saved_name)
            self.stdout.write(self.style.SUCCESS("[OK] Cleanup/deletion verified"))

            self.stdout.write(self.style.SUCCESS("\nAll Cloudflare R2 tests passed successfully!"))

        except Exception as exc:
            self.stdout.write(self.style.ERROR(f"\nR2 verification failed: {exc}"))
            raise
