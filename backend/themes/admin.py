from django.contrib import admin
from .models import Theme


@admin.register(Theme)
class ThemeAdmin(admin.ModelAdmin):
    list_display = ("name", "key", "version", "is_active", "created_at")
    search_fields = ("name", "key")
    list_filter = ("is_active",)
    fields = (
        "key",
        "name",
        "description",
        "version",
        "is_active",
        "svg_file",
        "preview_image",
        "css_vars_json",
        "assets_manifest",
        "preview_s3_key",
    )