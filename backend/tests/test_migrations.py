from io import StringIO

import pytest
from django.core.management import call_command


@pytest.mark.django_db
def test_no_missing_migrations() -> None:
    out = StringIO()
    call_command("makemigrations", "--check", "--dry-run", stdout=out, stderr=out)
    assert "Migrations for" not in out.getvalue(), f"Model changes not captured:\n{out.getvalue()}"
