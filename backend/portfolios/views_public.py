from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from accounts.models import Profile
from .serializers import ArtistLandingSerializer, ProfileSerializer, PortfolioSerializer

class ArtistLandingView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        # 1) Fetch profile (with user)
        profile = get_object_or_404(
            Profile.objects.select_related("user"),
            slug=slug
        )

        # 2) Public/link-only portfolios, ordered + prefetched
        portfolios_qs = (
            profile.user.portfolios
            .filter(privacy__in=["public", "link_only"])
            .order_by("order_index", "id")
            .prefetch_related("pages__page_media__media")
        )

        # 3) Return nested payload directly (no wrapper serializer)
        return Response({
            "profile": ProfileSerializer(profile).data,
            "portfolios": PortfolioSerializer(portfolios_qs, many=True).data,
        })
