import pytest
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

pytestmark = pytest.mark.django_db


def test_default_storage_backend_resolves_and_roundtrips() -> None:
    name = default_storage.save("test.txt", ContentFile(b"hello"))
    try:
        assert default_storage.exists(name)
        assert default_storage.open(name).read() == b"hello"
    finally:
        default_storage.delete(name)
