from django.db import models

class Theme(models.Model):
    key = models.CharField(max_length=100, unique=True)  # short key like "dark_blue"
    name = models.CharField(max_length=150)  # display name
    description = models.TextField(blank=True, null=True)
    version = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    css_vars_json = models.JSONField(blank=True, null=True)
    assets_manifest = models.JSONField(blank=True, null=True)
    preview_s3_key = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} (v{self.version})"