from django.shortcuts import get_object_or_404
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from accounts.models import Profile
from .models import Portfolio, Privacy
from .serializers import ArtistLandingSerializer, ArtistProfileSerializer, PortfolioSerializer
from portfolios.models import Portfolio
from portfolios.serializers import EditorPortfolioSerializer


class ArtistLandingView(APIView):
    """Public landing endpoint for an artist's profile + portfolios."""

    permission_classes = [AllowAny]

    def get(self, request, slug):
        # 1. Fetch profile (with its user)
        profile = get_object_or_404(
            Profile.objects.select_related("user"),
            slug=slug,
        )

        # 2. Fetch this artist's non-draft portfolios
        portfolios_qs = (
            Portfolio.objects.filter(user=profile.user)
            .exclude(privacy=Privacy.DRAFT)
            .order_by("order_index", "created_at")
        )

        # 3. Serialize profile + portfolios
        data = {
            "profile": ArtistProfileSerializer(
                profile, context={"request": request}
            ).data,
            "portfolios": PortfolioSerializer(
                portfolios_qs, many=True, context={"request": request}
            ).data,
        }

        # 4. Return JSON response
        return Response(data)
    
class PublicPortfolioDetailView(APIView):
    """
    Returns a single portfolio (with pages) for the public artist page.

    - If the visitor is not logged in or not the owner: only 'public' portfolios.
    - If the visitor *is* the owner: they can see their own private/link_only too.
    """

    permission_classes = [AllowAny]

    def get(self, request, artist_slug, slug, format=None):
        qs = Portfolio.objects.filter(user__slug=artist_slug, slug=slug)

        user = request.user if request.user and request.user.is_authenticated else None

        if not user or user.slug != artist_slug:
            qs = qs.filter(privacy="public")

        portfolio = get_object_or_404(qs)
        serializer = EditorPortfolioSerializer(portfolio)  # or your existing public serializer
        return Response(serializer.data)
