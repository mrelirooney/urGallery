from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions
from themes.models import Theme
from tags.models import Hashtag
from .serializers import (
    UserSerializer, ThemeSerializer, HashtagSerializer,
    PortfolioSerializer, PageSerializer, ProfileWriteSerializer
)
from portfolios.models import Portfolio, Page
from accounts.models import Profile

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

class ThemeListView(generics.ListAPIView):
    queryset = Theme.objects.filter(is_active=True).order_by("key")
    serializer_class = ThemeSerializer
    permission_classes = [permissions.AllowAny]

class HashtagListView(generics.ListAPIView):
    queryset = Hashtag.objects.all().order_by("name")
    serializer_class = HashtagSerializer
    permission_classes = [permissions.AllowAny]

class MyProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProfileWriteSerializer

    def get_object(self):
        # guarantee a profile exists
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile

class MyPortfolioListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PortfolioSerializer

    def get_queryset(self):
        return Portfolio.objects.filter(user=self.request.user).order_by("order_index", "id")

class MyPortfolioDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PortfolioSerializer

    def get_queryset(self):
        # ownership enforcement
        return Portfolio.objects.filter(user=self.request.user)

class PortfolioPublicListView(generics.ListAPIView):
    """Public browse endpoint (no auth)"""
    permission_classes = [permissions.AllowAny]
    serializer_class = PortfolioSerializer
    queryset = Portfolio.objects.filter(privacy="public").order_by("-updated_at")

class PageListCreateView(generics.ListCreateAPIView):
    """Pages for a given portfolio id (must own it)"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PageSerializer

    def get_queryset(self):
        return Page.objects.filter(portfolio__user=self.request.user,
                                   portfolio_id=self.kwargs["portfolio_id"]).order_by("order", "id")

    def perform_create(self, serializer):
        serializer.save()  # validate_portfolio() enforces ownership

class PageDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PageSerializer

    def get_queryset(self):
        return Page.objects.filter(portfolio__user=self.request.user)