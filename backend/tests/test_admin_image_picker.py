import datetime
import json
from io import BytesIO
from unittest.mock import MagicMock

import pytest
from accounts.models import User
from config.admin_views import r2_image_list_view
from config.admin_widgets import R2ImageFormField, R2PickerWidget
from conventions.models import Convention
from django import forms
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import RequestFactory
from PIL import Image

pytestmark = pytest.mark.django_db


@pytest.fixture
def staff_user() -> User:
    return User.objects.create_user(
        username="staff_tester",
        email="staff@example.com",
        password="password123",
        is_staff=True,
    )


@pytest.fixture
def regular_user() -> User:
    return User.objects.create_user(
        username="regular_tester",
        email="regular@example.com",
        password="password123",
        is_staff=False,
    )


def _create_test_image_file(name: str = "test.webp") -> SimpleUploadedFile:
    img = Image.new("RGB", (100, 100), color="blue")
    buf = BytesIO()
    img.save(buf, format="WEBP")
    return SimpleUploadedFile(name, buf.getvalue(), content_type="image/webp")


def test_r2_image_list_view_forbidden_for_anonymous() -> None:
    factory = RequestFactory()
    req = factory.get("/admin/r2-images/")
    req.user = MagicMock(is_authenticated=False, is_staff=False)
    resp = r2_image_list_view(req)
    assert resp.status_code == 403


def test_r2_image_list_view_forbidden_for_non_staff(regular_user: User) -> None:
    factory = RequestFactory()
    req = factory.get("/admin/r2-images/")
    req.user = regular_user
    resp = r2_image_list_view(req)
    assert resp.status_code == 403


def test_r2_image_list_view_allowed_for_staff(staff_user: User) -> None:
    factory = RequestFactory()
    req = factory.get("/admin/r2-images/")
    req.user = staff_user
    resp = r2_image_list_view(req)
    assert resp.status_code == 200
    data = json.loads(resp.content)
    assert "images" in data
    assert "folders" in data
    assert "total" in data
    assert isinstance(data["images"], list)
    assert isinstance(data["folders"], list)


def test_r2_image_list_view_filters(staff_user: User) -> None:
    # Save a temporary file to default_storage
    test_key = "conventions/banners/_pytest_test_banner.webp"
    default_storage.save(test_key, ContentFile(b"test-image-binary-data"))
    try:
        factory = RequestFactory()

        # Search matching
        req = factory.get("/admin/r2-images/?search=_pytest_test_banner")
        req.user = staff_user
        resp = r2_image_list_view(req)
        assert resp.status_code == 200
        keys = [item["key"] for item in json.loads(resp.content)["images"]]
        assert test_key in keys

        # Search non-matching
        req2 = factory.get("/admin/r2-images/?search=non_existent_random_key_12345")
        req2.user = staff_user
        resp2 = r2_image_list_view(req2)
        assert resp2.status_code == 200
        assert len(json.loads(resp2.content)["images"]) == 0
    finally:
        default_storage.delete(test_key)


def test_r2_image_form_field_with_valid_storage_key() -> None:
    test_key = "conventions/banners/_pytest_valid.webp"
    default_storage.save(test_key, ContentFile(b"valid"))
    try:
        field = R2ImageFormField(required=False)
        cleaned = field.clean(test_key)
        assert cleaned == test_key
    finally:
        default_storage.delete(test_key)


def test_r2_image_form_field_with_invalid_storage_key() -> None:
    field = R2ImageFormField(required=False)
    with pytest.raises(forms.ValidationError) as exc_info:
        field.clean("non_existent_folder/missing_image_xyz.webp")
    assert "does not exist in storage" in str(exc_info.value)


def test_r2_image_form_field_with_uploaded_file() -> None:
    field = R2ImageFormField(required=False)
    uploaded = _create_test_image_file()
    cleaned = field.clean(uploaded)
    assert cleaned == uploaded


def test_r2_picker_widget_value_from_datadict() -> None:
    widget = R2PickerWidget(upload_to="conventions/banners")

    # 1. R2 key selected
    data = {"banner_r2_key": "conventions/banners/sample.webp"}
    files: dict = {}
    assert widget.value_from_datadict(data, files, "banner") == "conventions/banners/sample.webp"

    # 2. File uploaded overrides empty key
    uploaded_file = _create_test_image_file()
    files = {"banner": uploaded_file}
    assert widget.value_from_datadict(data, files, "banner") == uploaded_file

    # 3. Clear checkbox checked
    data_clear = {"banner-clear": "on"}
    assert widget.value_from_datadict(data_clear, {}, "banner") is False


def test_r2_picker_widget_renders_template() -> None:
    widget = R2PickerWidget(upload_to="conventions/banners")
    rendered = widget.render("banner", None, attrs={"id": "id_banner"})
    assert "r2-image-picker-root" in rendered
    assert "Select from R2" in rendered
    assert 'name="banner_r2_key"' in rendered
    assert 'data-folder="conventions/banners"' in rendered


def test_convention_admin_form_saves_r2_key() -> None:
    test_key = "conventions/banners/_pytest_save_test.webp"
    default_storage.save(test_key, ContentFile(b"test"))
    try:
        class DummyConventionForm(forms.ModelForm):
            banner = R2ImageFormField(required=False)

            class Meta:
                model = Convention
                fields = ["name", "slug", "starts_at", "ends_at", "banner"]

        form_data = {
            "name": "Pytest Con",
            "slug": "pytest-con-r2",
            "starts_at": datetime.date(2027, 8, 1),
            "ends_at": datetime.date(2027, 8, 3),
            "banner_r2_key": test_key,
        }
        form = DummyConventionForm(data=form_data)
        assert form.is_valid(), form.errors
        convention = form.save()
        assert convention.banner.name == test_key
        assert test_key in convention.banner.url
    finally:
        default_storage.delete(test_key)
