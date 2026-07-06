# backend/artists/api.py

from django.contrib.auth import get_user_model
from django.db.models import Q, F, Value, Case, When, IntegerField
from django.db.models.functions import Coalesce
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response

from config.utils import build_media_url
from portfolios.models import Portfolio

User = get_user_model()


def _page_preview_url(request, page):
    if not page:
        return None
    img = page.media_image or page.media_image_2
    if not img:
        return None
    try:
        return build_media_url(request, img.url)
    except Exception:
        return None


def _portfolio_preview(request, portfolio):
    if not portfolio:
        return None, None, None
    page = portfolio.cover_page
    if page is None:
        pages = sorted(portfolio.pages.all(), key=lambda p: p.order)
        page = pages[0] if pages else None
    return (
        portfolio.slug,
        portfolio.title or "",
        _page_preview_url(request, page),
    )


def _primary_public_portfolios_by_user(user_ids):
    """First public portfolio per user, ordered by order_index then id."""
    portfolios = (
        Portfolio.objects.filter(user_id__in=user_ids, privacy="public")
        .select_related("cover_page")
        .prefetch_related("pages")
        .order_by("user_id", "order_index", "id")
    )
    by_user = {}
    for portfolio in portfolios:
        if portfolio.user_id not in by_user:
            by_user[portfolio.user_id] = portfolio
    return by_user


# -----------------------------
# /api/artists/search/?q=<term>
# -----------------------------
@api_view(["GET"])
def search_artists(request):
    """
    Lightweight search. Matches display_name, title, location, slug, or hashtags.
    Hashtags have lower weight than name, title, location.
    """
    q = (request.GET.get("q") or "").strip()
    if not q:
        return Response({"results": []})

    try:
        limit = int(request.GET.get("limit") or 12)
    except (TypeError, ValueError):
        limit = 12
    limit = max(1, min(limit, 50))

    q_slug = q.replace(" ", "-").lower()

    try:
        # Relevance: 5=name starts, 4=name contains, 3=title, 2=location/slug, 1=hashtag, 0=no match
        relevance = Case(
            When(
                Q(display_name__istartswith=q) | Q(profile__display_name__istartswith=q),
                then=Value(5),
            ),
            When(
                Q(display_name__icontains=q) | Q(profile__display_name__icontains=q),
                then=Value(4),
            ),
            When(
                Q(title__icontains=q) | Q(profile__title__icontains=q),
                then=Value(3),
            ),
            When(
                Q(location__icontains=q)
                | Q(profile__location__icontains=q)
                | Q(profile__slug__icontains=q),
                then=Value(2),
            ),
            When(
                Q(user_hashtags__hashtag__name__icontains=q)
                | Q(user_hashtags__hashtag__slug__icontains=q)
                | Q(user_hashtags__hashtag__slug__icontains=q_slug),
                then=Value(1),
            ),
            default=Value(0),
            output_field=IntegerField(),
        )
        effective_name = Coalesce(F("display_name"), F("profile__display_name"), Value(""))

        rows = (
            User.objects.filter(
                Q(display_name__icontains=q)
                | Q(title__icontains=q)
                | Q(location__icontains=q)
                | Q(profile__display_name__icontains=q)
                | Q(profile__title__icontains=q)
                | Q(profile__location__icontains=q)
                | Q(profile__slug__icontains=q)
                | Q(user_hashtags__hashtag__name__icontains=q)
                | Q(user_hashtags__hashtag__slug__icontains=q)
                | Q(user_hashtags__hashtag__slug__icontains=q_slug)
            )
            .select_related("profile")
            .distinct()
            .annotate(relevance_score=relevance, _effective_name=effective_name)
            .order_by("-relevance_score", "_effective_name")[:limit]
        )

        portfolio_by_user = _primary_public_portfolios_by_user([u.id for u in rows])

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
                    avatar_url = build_media_url(request, user.avatar.url)
                except Exception:
                    avatar_url = ""
            # Fallback to profile avatar if user avatar doesn't exist
            elif hasattr(user, "profile") and user.profile:
                if user.profile.avatar_s3_key:
                    if user.profile.avatar_s3_key.startswith("http"):
                        avatar_url = user.profile.avatar_s3_key
                    else:
                        avatar_url = build_media_url(request, user.profile.avatar_s3_key)
                elif user.profile.default_avatar:
                    s3_key = user.profile.default_avatar.s3_key or ""
                    if s3_key.startswith("http"):
                        avatar_url = s3_key
                    else:
                        avatar_url = build_media_url(request, s3_key) if s3_key else ""
            
            portfolio = portfolio_by_user.get(user.id)
            portfolio_slug, portfolio_title, preview_image_url = _portfolio_preview(
                request, portfolio
            )

            # Only add if we have at least a display_name or slug
            if display_name or slug:
                results.append({
                    "slug": slug,
                    "display_name": display_name,
                    "title": title,
                    "location": location,
                    "avatar_url": avatar_url,
                    "portfolio_slug": portfolio_slug,
                    "portfolio_title": portfolio_title,
                    "preview_image_url": preview_image_url,
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
        avatar_url = build_media_url(request, user.avatar.url) if user.avatar else ""
    except Exception:
        avatar_url = ""

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
