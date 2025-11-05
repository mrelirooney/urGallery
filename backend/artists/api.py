# backend/artists/api.py

from django.contrib.auth import get_user_model
from django.db.models import Q, F
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response

from portfolios.models import Portfolio

User = get_user_model()


# -----------------------------
# /api/artists/search/?q=<term>
# -----------------------------
@api_view(["GET"])
def search_artists(request):
    """
    Lightweight search. Matches display_name, title, location, or slug.
    Returns only the fields the UI needs.
    """
    q = (request.GET.get("q") or "").strip()
    if not q:
        return Response({"results": []})

    rows = (
        User.objects.filter(
            Q(display_name__icontains=q)
            | Q(title__icontains=q)
            | Q(location__icontains=q)
            | Q(profile__slug__icontains=q)  # slug lives on Profile
        )
        .select_related("profile")
        .annotate(slug=F("profile__slug"))
        .order_by("display_name")[:12]
        .values("slug", "display_name", "title", "location", "avatar")
    )

    results = [
        {
            "slug": r["slug"],
            "display_name": r["display_name"] or "",
            "title": r["title"] or "",
            "location": r["location"] or "",
            # avatar is an ImageField on User; resolve to URL when possible
            "avatar_url": getattr(r.get("avatar"), "url", None) or r.get("avatar") or "",
        }
        for r in rows
    ]
    return Response({"results": results})


# -----------------------------
# /api/artists/<slug>/
# -----------------------------
@api_view(["GET"])
def artist_detail(request, slug):
    """
    Return a single artist's profile info + a list of their portfolios.

    Response shape (what the frontend expects):
    {
      "profile": {
        "slug", "display_name", "title", "location", "bio", "avatar_url"
      },
      "portfolios": [
        { "id", "slug", "title", "privacy_status" }
      ]
    }
    """
    # Grab the user by profile slug (no separate ArtistProfile model needed)
    user = get_object_or_404(
        User.objects.select_related("profile"),
        profile__slug=slug,
    )

    # Best-effort URL for avatar (handles raw string or ImageField)
    try:
        avatar_url = user.avatar.url  # ImageField case
    except Exception:
        avatar_url = (user.avatar or "")  # raw path / empty

    # Pull a lightweight list of portfolios (only fields we actually use in UI)
    # NOTE: earlier crashes were from using non-existent fields like "cover" or "is_public".
    qs = (
        Portfolio.objects.filter(user=user)
        .order_by("-created_at")
        .values("id", "slug", "title", "privacy")
    )

    portfolios = [
        {
            "id": p["id"],
            "slug": p["slug"],
            "title": p["title"] or "",
            # Map your enum/choice to a friendly label; adjust if needed.
            "privacy_status": str(p.get("privacy") or "").capitalize(),
        }
        for p in qs
    ]

    data = {
        "profile": {
            "slug": user.profile.slug,
            "display_name": user.display_name or user.first_name or user.email or "",
            "title": user.title or "",
            "location": user.location or "",
            "bio": getattr(user, "bio", "") or "",
            "avatar_url": avatar_url,
        },
        "portfolios": portfolios,
    }
    return Response(data)
