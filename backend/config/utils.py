"""
Shared utilities for the config project.
"""

from django.conf import settings


def build_media_url(request, relative_path):
    """
    Build an absolute URL for a media file (avatar, banner, etc.).

    When PUBLIC_API_BASE is set (e.g. in Docker), use it so the browser can
    reach the URL. Otherwise fall back to request.build_absolute_uri().
    """
    if not relative_path:
        return None
    path = relative_path if relative_path.startswith("/") else f"/{relative_path}"
    base = getattr(settings, "PUBLIC_API_BASE", None) or ""
    if base:
        return f"{base}{path}"
    return request.build_absolute_uri(path) if request else path
