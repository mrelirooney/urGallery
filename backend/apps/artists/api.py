# backend/apps/artists/api.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q
from django.utils.text import slugify
from accounts.models import User  # your custom user

def _avatar_url(u):
    try:
        if getattr(u, "avatar", None):
            return u.avatar.url
    except Exception:
        pass
    return None

def _best_slug(u):
    # try related profile.slug -> user.slug -> fallback from display_name/email
    slug = None
    prof = getattr(u, "profile", None)
    if prof and getattr(prof, "slug", None):
        slug = prof.slug
    elif getattr(u, "slug", None):
        slug = u.slug
    if not slug:
        base = (getattr(u, "display_name", None)
                or getattr(u, "email", "")).split("@")[0]
        slug = slugify(base) or str(u.pk)
    return slug

@api_view(["GET"])
def search_artists(request):
    q = (request.GET.get("q") or "").strip()
    if not q:
        return Response({"results": []})

    qs = (
        User.objects
            .filter(
                Q(display_name__icontains=q) |
                Q(first_name__icontains=q) |
                Q(last_name__icontains=q)
            )
            .order_by("display_name")[:12]
    )

    results = [{
        "slug": _best_slug(u),
        "display_name": getattr(u, "display_name", None),
        "avatar_url": _avatar_url(u),
    } for u in qs]

    return Response({"results": results})
