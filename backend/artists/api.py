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
    Searches both User and Profile fields.
    Returns only the fields the UI needs.
    """
    q = (request.GET.get("q") or "").strip()
    if not q:
        return Response({"results": []})

    try:
        # Search users - check BOTH User fields AND Profile fields
        rows = (
            User.objects.filter(
                Q(display_name__icontains=q)
                | Q(title__icontains=q)
                | Q(location__icontains=q)
                | Q(profile__display_name__icontains=q)  # Profile display_name
                | Q(profile__title__icontains=q)  # Profile title
                | Q(profile__location__icontains=q)  # Profile location
                | Q(profile__slug__icontains=q)  # Profile slug
            )
            .select_related("profile")
            .distinct()  # Avoid duplicates from joins
            .order_by("display_name", "profile__display_name")[:12]
        )

        results = []
        for user in rows:
            # Get slug from profile if it exists
            slug = ""
            if hasattr(user, "profile") and user.profile:
                slug = user.profile.slug or ""
            
            # Get display_name from Profile if User doesn't have it, otherwise use User's
            display_name = user.display_name or ""
            if not display_name and hasattr(user, "profile") and user.profile:
                display_name = user.profile.display_name or ""
            
            # Get title from Profile if User doesn't have it, otherwise use User's
            title = user.title or ""
            if not title and hasattr(user, "profile") and user.profile:
                title = user.profile.title or ""
            
            # Get location from Profile if User doesn't have it, otherwise use User's
            location = user.location or ""
            if not location and hasattr(user, "profile") and user.profile:
                location = user.profile.location or ""
            
            # Handle avatar URL properly - return full absolute URLs
            avatar_url = ""
            if user.avatar:
                try:
                    # Build absolute URL for media files
                    relative_url = user.avatar.url  # e.g., "/media/avatars/file.jpg"
                    avatar_url = request.build_absolute_uri(relative_url)
                except Exception as e:
                    avatar_url = ""
            # Fallback to profile avatar if user avatar doesn't exist
            elif hasattr(user, "profile") and user.profile:
                if user.profile.avatar_s3_key:
                    # If it's already a full URL, use it; otherwise build absolute URL
                    if user.profile.avatar_s3_key.startswith("http"):
                        avatar_url = user.profile.avatar_s3_key
                    else:
                        avatar_url = request.build_absolute_uri(user.profile.avatar_s3_key)
                elif user.profile.default_avatar:
                    s3_key = user.profile.default_avatar.s3_key or ""
                    if s3_key.startswith("http"):
                        avatar_url = s3_key
                    else:
                        avatar_url = request.build_absolute_uri(s3_key) if s3_key else ""
            
            # Only add if we have at least a display_name or slug
            if display_name or slug:
                results.append({
                    "slug": slug,
                    "display_name": display_name,
                    "title": title,
                    "location": location,
                    "avatar_url": avatar_url,
                })
        
        return Response({"results": results})
    except Exception as e:
        # Log the error for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Search error: {str(e)}", exc_info=True)
        return Response({"results": [], "error": str(e)}, status=500)


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
