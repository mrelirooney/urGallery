from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from accounts.models import Profile
from portfolios.models import Portfolio
from .models import SavedArtist, SavedPortfolio
from .serializers import SavedArtistSerializer, SavedPortfolioSerializer


class MySavesView(APIView):
    """
    GET /api/my/saves/
    Returns the authenticated user's saved artists and portfolios.
    Default: chronological (newest first). ?sort=alpha for alphabetical.
    ?q= to filter by name/title/location.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sort = request.GET.get("sort", "recent")
        q = (request.GET.get("q") or "").strip().lower()

        saved_artists_qs = SavedArtist.objects.filter(
            user=request.user
        ).select_related("profile")

        saved_portfolios_qs = SavedPortfolio.objects.filter(
            user=request.user
        ).select_related("portfolio__user__profile")

        if q:
            saved_artists_qs = saved_artists_qs.filter(
                profile__display_name__icontains=q
            ) | saved_artists_qs.filter(
                profile__title__icontains=q
            ) | saved_artists_qs.filter(
                profile__location__icontains=q
            )
            saved_portfolios_qs = saved_portfolios_qs.filter(
                portfolio__title__icontains=q
            )

        if sort == "alpha":
            saved_artists_qs = saved_artists_qs.order_by("profile__display_name")
            saved_portfolios_qs = saved_portfolios_qs.order_by("portfolio__title")

        return Response({
            "artists": SavedArtistSerializer(saved_artists_qs, many=True).data,
            "portfolios": SavedPortfolioSerializer(saved_portfolios_qs, many=True).data,
        })


class SaveArtistView(APIView):
    """
    POST   /api/my/saves/artists/<artist_slug>/   Save an artist
    DELETE /api/my/saves/artists/<artist_slug>/   Unsave an artist
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, artist_slug):
        profile = get_object_or_404(Profile, slug=artist_slug)
        if profile.user == request.user:
            return Response({"detail": "Cannot save your own profile."}, status=status.HTTP_400_BAD_REQUEST)
        _, created = SavedArtist.objects.get_or_create(user=request.user, profile=profile)
        if not created:
            return Response({"detail": "Already saved."}, status=status.HTTP_200_OK)
        return Response({"detail": "Saved."}, status=status.HTTP_201_CREATED)

    def delete(self, request, artist_slug):
        profile = get_object_or_404(Profile, slug=artist_slug)
        deleted, _ = SavedArtist.objects.filter(user=request.user, profile=profile).delete()
        if deleted:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"detail": "Not saved."}, status=status.HTTP_404_NOT_FOUND)


class SavePortfolioView(APIView):
    """
    POST   /api/my/saves/portfolios/<artist_slug>/<portfolio_slug>/   Save a portfolio
    DELETE /api/my/saves/portfolios/<artist_slug>/<portfolio_slug>/   Unsave a portfolio
    """
    permission_classes = [IsAuthenticated]

    def _get_portfolio(self, artist_slug, portfolio_slug):
        owner = get_object_or_404(Profile, slug=artist_slug).user
        return get_object_or_404(Portfolio, user=owner, slug=portfolio_slug, privacy__in=["public", "link_only"])

    def post(self, request, artist_slug, portfolio_slug):
        portfolio = self._get_portfolio(artist_slug, portfolio_slug)
        if portfolio.user == request.user:
            return Response({"detail": "Cannot save your own portfolio."}, status=status.HTTP_400_BAD_REQUEST)
        _, created = SavedPortfolio.objects.get_or_create(user=request.user, portfolio=portfolio)
        if not created:
            return Response({"detail": "Already saved."}, status=status.HTTP_200_OK)
        return Response({"detail": "Saved."}, status=status.HTTP_201_CREATED)

    def delete(self, request, artist_slug, portfolio_slug):
        portfolio = self._get_portfolio(artist_slug, portfolio_slug)
        deleted, _ = SavedPortfolio.objects.filter(user=request.user, portfolio=portfolio).delete()
        if deleted:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"detail": "Not saved."}, status=status.HTTP_404_NOT_FOUND)
