"""Custom widgets, form fields, and ModelAdmin mixins for Cloudflare R2 image selection."""

from collections.abc import Mapping
from typing import Any

from django import forms
from django.core.files.storage import default_storage
from django.db import models
from django.utils.datastructures import MultiValueDict
from imagekit.models import ProcessedImageField  # type: ignore[import-untyped]


class R2PickerWidget(forms.ClearableFileInput):
    """
    Enhanced ClearableFileInput widget that allows selecting existing images from Cloudflare R2.
    Renders standard file upload + 'Select from R2' trigger button.
    """

    template_name = "admin/widgets/r2_image_picker.html"

    class Media:
        css = {"all": ("admin/css/r2_image_picker.css",)}
        js = ("admin/js/r2_image_picker.js",)

    def __init__(self, upload_to: str = "", *args: Any, **kwargs: Any) -> None:
        self.upload_to = upload_to.strip("/") if isinstance(upload_to, str) else ""
        super().__init__(*args, **kwargs)

    def get_context(self, name: str, value: Any, attrs: dict[str, Any] | None) -> dict[str, Any]:
        context = super().get_context(name, value, attrs)
        widget = context["widget"]
        widget_id = widget["attrs"].get("id", name)
        widget["upload_to"] = self.upload_to
        widget["r2_key_name"] = f"{name}_r2_key"
        widget["r2_key_id"] = f"{widget_id}_r2_key"
        widget["preview_id"] = f"{widget_id}_preview"

        # Determine current URL if value is set
        current_url = ""
        if value:
            if hasattr(value, "url"):
                try:
                    current_url = value.url
                except Exception:
                    current_url = ""
            elif isinstance(value, str):
                current_url = default_storage.url(value)

        widget["current_url"] = current_url
        return context

    def value_from_datadict(
        self, data: Mapping[str, Any], files: MultiValueDict[str, Any], name: str
    ) -> Any:
        # Check standard upload file first
        upload = super().value_from_datadict(data, files, name)
        if upload:
            return upload
        if upload is False:
            return False

        # Check if an R2 key was selected from the modal
        r2_key = data.get(f"{name}_r2_key")
        if r2_key and isinstance(r2_key, str) and r2_key.strip():
            return r2_key.strip()

        return upload


class R2ImageFormField(forms.ImageField):
    """
    Image form field that accepts either a standard UploadedFile or an existing R2 storage key.
    """

    widget = R2PickerWidget

    def clean(self, data: Any, initial: Any = None) -> Any:
        if isinstance(data, str) and data.strip():
            key = data.strip()
            # Verify file exists on default_storage
            if not default_storage.exists(key):
                raise forms.ValidationError(
                    f"The selected image '{key}' does not exist in storage."
                )
            return key

        return super().clean(data, initial=initial)


class R2AdminMediaMixin:
    """
    Mixin for ModelAdmin classes that automatically equips all ImageField and ProcessedImageField
    fields with the R2PickerWidget and R2ImageFormField.
    """

    def formfield_for_dbfield(self, db_field: models.Field, request: Any, **kwargs: Any) -> Any:
        if isinstance(db_field, (models.ImageField, ProcessedImageField)):
            upload_to = getattr(db_field, "upload_to", "")
            if callable(upload_to):
                upload_to = ""

            kwargs["form_class"] = R2ImageFormField
            kwargs["widget"] = R2PickerWidget(upload_to=str(upload_to))
            return db_field.formfield(**kwargs)

        return super().formfield_for_dbfield(db_field, request, **kwargs)  # type: ignore[misc]
