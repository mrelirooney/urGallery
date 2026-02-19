# backend/artists/views.py

from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from accounts.models import Profile
from portfolios.models import Portfolio 
from .serializers import ArtistProfileSerializer
from rest_framework.generics import RetrieveAPIView
from portfolios.serializers import PublicPortfolioSerializer


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

        # 3) Base queryset = this user's portfolios
        portfolios_qs = Portfolio.objects.filter(user=profile.user)

        # 4) Privacy rules:
        #    - If the viewer is the owner → show all portfolios
        #    - Otherwise → show public AND link_only portfolios
        is_owner = request.user.is_authenticated and request.user == profile.user
        if not is_owner:
            portfolios_qs = portfolios_qs.filter(privacy__in=["public", "link_only"])
        
        # 5) Order portfolios: public first, then by order_index, then by id
        # This ensures the first public portfolio shows by default
        from django.db.models import Case, When, IntegerField
        portfolios_qs = portfolios_qs.annotate(
            privacy_priority=Case(
                When(privacy="public", then=1),
                When(privacy="link_only", then=2),
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
    lookup_field = "slug"  # portfolio slug
    permission_classes = [AllowAny]  # Allow unauthenticated users to view public portfolios
    
    def get_queryset(self):
        artist_slug = self.kwargs["artist_slug"]

        # Get the artist's user object
        owner = get_object_or_404(Profile, slug=artist_slug).user

        # If the request user *is* the owner → show all portfolios
        if self.request.user.is_authenticated and self.request.user == owner:
            return Portfolio.objects.filter(user=owner)

        # Otherwise → show public portfolios AND link_only (private) portfolios
        # Anyone with the direct link can view link_only portfolios
        return Portfolio.objects.filter(
            user=owner,
            privacy__in=["public", "link_only"],
        )

