"""
Shared utilities for the config project.
"""

from django.conf import settings


def build_media_url(request, relative_path):
    """
    Build an absolute URL for a media file (avatar, banner, etc.).

    When PUBLIC_API_BASE is set (e.g. in Docker), use it so the browser can
    reach the URL. When empty (e.g. single ngrok tunnel with Next.js proxy),
    return a relative path so the browser fetches from same origin via /media/* rewrite.
    """
    if not relative_path:
        return None
    path = relative_path if relative_path.startswith("/") else f"/{relative_path}"
    base = getattr(settings, "PUBLIC_API_BASE", None) or ""
    if base:
        return f"{base}{path}"
    # Return relative path so browser fetches from same origin (Next.js /media/* rewrite)
    return path
