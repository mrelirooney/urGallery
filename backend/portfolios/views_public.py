from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from accounts.models import Profile
from .serializers import ArtistLandingSerializer, ArtistProfileSerializer, PortfolioSerializer
from django.conf import settings


class ArtistLandingView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        # 1. Fetch profile (with user)
        profile = get_object_or_404(
            Profile.objects.select_related("user"),
            slug=slug
        )

        # 2. Public/link-only portfolios
        portfolios_qs = (
            profile.user.portfolios
            .filter(privacy__in=["public", "link_only"])
            .order_by("order_index", "id")
            .prefetch_related("pages__page_media__media")
        )

        # 3. Serialize both profile + portfolios
        data = {
            "profile": ArtistProfileSerializer(profile, context={"request": request}).data,
            "portfolios": PortfolioSerializer(portfolios_qs, many=True, context={"request": request}).data,
        }

        # 4. Return JSON response
        return Response(data)
    
   
    
    
