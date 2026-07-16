# backend/artists/views.py

import time
from django.shortcuts import get_object_or_404
from django.core.signing import TimestampSigner

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import generics, status
from accounts.models import Profile
from portfolios.models import Portfolio, Comment
from .serializers import ArtistProfileSerializer
from rest_framework.generics import RetrieveAPIView
from portfolios.serializers import PublicPortfolioSerializer, CommentSerializer


class ArtistLandingView(APIView):
    """
    Returns the data needed for the public artist page.

    {
        "profile": { ... },
        "portfolios": [ ... ]
    }

    Profile is always returned.
    Portfolios are filtered to public ones for visitors, and all for the owner.
    """

    permission_classes = [AllowAny]

    def get(self, request, slug: str):
        # 1) Find the profile for this slug (select_related theme for serializer)
        profile = get_object_or_404(
            Profile.objects.select_related("theme"),
            slug=slug,
        )

        # 2) Serialize profile exactly like before
        profile_data = ArtistProfileSerializer(
            profile, context={"request": request}
        ).data

        # 3) Base queryset = this user's portfolios (exclude drafts - only public/private)
        portfolios_qs = Portfolio.objects.filter(user=profile.user).exclude(privacy="draft")

        # 4) Privacy rules: show all portfolios to everyone (private appear in menu;
        #    frontend blurs private content for non-owners)
        
        # 5) Order portfolios: public first, then by order_index, then by id
        # This ensures the first public portfolio shows by default
        from django.db.models import Case, When, IntegerField
        portfolios_qs = portfolios_qs.annotate(
            privacy_priority=Case(
                When(privacy="public", then=1),
                When(privacy="private", then=2),
                default=3,
                output_field=IntegerField(),
            )
        ).order_by("privacy_priority", "order_index", "id")

        # 5) Build a lightweight summary for each portfolio
        portfolios_data = []
        for p in portfolios_qs:
            cover = p.cover_page  # may be None

            portfolios_data.append(
                {
                    "id": p.id,
                    "slug": p.slug,
                    "title": p.title,
                    "privacy": p.privacy,
                    "order_index": p.order_index,
                    "pages_count": p.pages_count,
                    # Optional "first_page" object so the UI can show a preview
                    "first_page": {
                        "id": cover.id if cover else None,
                        "title": getattr(cover, "title", None) if cover else None,
                        "layout": getattr(cover, "layout", None) if cover else None,
                        "description": getattr(cover, "description", None)
                        if cover
                        else "",
                    }
                    if cover
                    else None,
                }
            )

        # 6) Final response matches what the Next.js page expects
        return Response(
            {
                "profile": profile_data,
                "portfolios": portfolios_data,
            }
        )
    
class ArtistPortfolioDetailView(RetrieveAPIView):
    serializer_class = PublicPortfolioSerializer
    lookup_field = "slug"
    permission_classes = [AllowAny]

    def get_queryset(self):
        artist_slug = self.kwargs["artist_slug"]
        owner = get_object_or_404(Profile, slug=artist_slug).user
        # Return all portfolios (frontend blurs private for non-owners)
        return Portfolio.objects.filter(user=owner)


class PortfolioUnlockView(APIView):
    """
    POST /api/artists/<artist_slug>/portfolios/<portfolio_slug>/unlock/
    Body: { "password": "..." }
    Returns: { "token": "signed_token" } on success.
    """
    permission_classes = [AllowAny]

    def post(self, request, artist_slug: str, slug: str):
        owner = get_object_or_404(Profile, slug=artist_slug).user
        portfolio = get_object_or_404(
            Portfolio.objects.filter(user=owner),
            slug=slug,
        )
        if portfolio.privacy != "private":
            return Response(
                {"detail": "This portfolio is not password-protected."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        password = (request.data.get("password") or "").strip()
        if not portfolio.check_password(password):
            return Response(
                {"detail": "Incorrect password."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        signer = TimestampSigner()
        token = signer.sign(f"unlock:{portfolio.id}")
        expires_at = int(time.time()) + (7 * 24 * 60 * 60)  # 7 days from now
        return Response({"token": token, "expires_at": expires_at})


class PortfolioPrivacyView(APIView):
    """
    PATCH /api/artists/<artist_slug>/portfolios/<portfolio_slug>/privacy/
    Body: { "privacy": "public" | "private", "password": "..." }  (password required when going private)
    Owner only. Updates live portfolio and draft to keep in sync.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, artist_slug: str, slug: str):
        owner = get_object_or_404(Profile, slug=artist_slug).user
        if request.user != owner:
            return Response(
                {"detail": "Only the owner can change privacy."},
                status=status.HTTP_403_FORBIDDEN,
            )
        portfolio = get_object_or_404(
            Portfolio.objects.filter(user=owner),
            slug=slug,
        )
        new_privacy = (request.data.get("privacy") or "").strip().lower()
        if new_privacy not in ("public", "private"):
            return Response(
                {"detail": "privacy must be 'public' or 'private'."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        password = (request.data.get("password") or "").strip()

        if new_privacy == "private":
            if not password:
                return Response(
                    {"detail": "A password is required for private portfolios."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            from django.contrib.auth.hashers import make_password
            portfolio.password = make_password(password)
        else:
            portfolio.password = ""

        portfolio.privacy = new_privacy
        portfolio.save()

        # Sync draft (create if missing) so owner can pre-fill password when setting private again
        from portfolios.editor_views import _get_or_create_draft
        from portfolios.models import DraftPortfolio
        draft = _get_or_create_draft(slug, owner)
        draft.privacy = new_privacy
        if new_privacy == "private":
            draft.password = password  # Store plaintext for owner pre-fill
        # When going public, keep draft.password for pre-fill
        draft.save()

        return Response({"privacy": new_privacy})


# ---------- COMMENTS ----------


class PortfolioCommentListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/artists/<artist_slug>/portfolios/<portfolio_slug>/comments/
         List comments on a portfolio. Requires access (portfolio must be visible to requester).

    POST /api/artists/<artist_slug>/portfolios/<portfolio_slug>/comments/
         Create a comment. Authenticated users only.
    """
    serializer_class = CommentSerializer

    def _get_portfolio(self):
        artist_slug = self.kwargs["artist_slug"]
        portfolio_slug = self.kwargs["slug"]
        owner = get_object_or_404(Profile, slug=artist_slug).user
        qs = Portfolio.objects.filter(user=owner, slug=portfolio_slug)
        if not (self.request.user.is_authenticated and self.request.user == owner):
            qs = qs.filter(privacy__in=["public", "private"])
        return get_object_or_404(qs)

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_queryset(self):
        portfolio = self._get_portfolio()
        return Comment.objects.filter(portfolio=portfolio).select_related(
            "author__profile", "author__profile__default_avatar", "portfolio"
        )

    def perform_create(self, serializer):
        portfolio = self._get_portfolio()
        serializer.save(author=self.request.user, portfolio=portfolio)


class PortfolioCommentDeleteView(generics.DestroyAPIView):
    """
    DELETE /api/artists/<artist_slug>/portfolios/<portfolio_slug>/comments/<id>/
    Author or portfolio owner can delete.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self):
        comment = get_object_or_404(
            Comment.objects.select_related("portfolio__user", "author"),
            pk=self.kwargs["pk"],
        )
        user = self.request.user
        portfolio_owner = comment.portfolio.user
        if user != comment.author and user != portfolio_owner:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only the author or portfolio owner can delete this comment.")
        return comment

