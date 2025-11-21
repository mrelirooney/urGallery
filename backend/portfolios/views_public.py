from django.shortcuts import get_object_or_404
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from accounts.models import Profile
from .models import Portfolio, Privacy
from .serializers import ArtistLandingSerializer, ArtistProfileSerializer, PortfolioSerializer


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
