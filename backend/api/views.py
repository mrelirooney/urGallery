from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions, status

from themes.models import Theme
from tags.models import Hashtag
from portfolios.models import Portfolio, Page, DraftPortfolio
from accounts.models import Profile

from .serializers import (
    UserSerializer,
    ThemeSerializer,
    HashtagSerializer,
    PortfolioSerializer,
    PageSerializer,
    ProfileWriteSerializer,
)

from django.contrib.auth import authenticate, login, logout, get_user_model
from rest_framework.decorators import (
    api_view,
    permission_classes,
    authentication_classes,
)
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated

User = get_user_model()


# ---------- AUTH / CURRENT USER ----------


@api_view(["POST"])
@authentication_classes([])  # login must not require auth
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"detail": "Username and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(request, username=username, password=password)

    if user is None:
        return Response(
            {"detail": "Invalid credentials."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Create Django session
    login(request, user)

    # Pull profile slug if available
    profile_slug = None
    try:
        profile_slug = user.profile.slug
    except:
        pass

    return Response(
        {
            "id": user.id,
            "username": user.username,
            "email": getattr(user, "email", ""),
            "slug": profile_slug,
            "detail": "Login successful",
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Log the current user out (destroy the session).
    """
    logout(request)
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def me_view(request):
    user = request.user

    profile_slug = None
    try:
        profile_slug = user.profile.slug
    except:
        pass

    return Response(
        {
            "id": user.id,
            "username": user.username,
            "email": getattr(user, "email", ""),
            "slug": profile_slug,
        },
        status=status.HTTP_200_OK,
    )


# ---------- THEMES / TAGS ----------


class ThemeListView(generics.ListAPIView):
    queryset = Theme.objects.filter(is_active=True).order_by("key")
    serializer_class = ThemeSerializer
    permission_classes = [permissions.AllowAny]


class HashtagListView(generics.ListAPIView):
    queryset = Hashtag.objects.all().order_by("name")
    serializer_class = HashtagSerializer
    permission_classes = [permissions.AllowAny]


# ---------- PROFILE ----------


class MyProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProfileWriteSerializer

    def get_object(self):
        # guarantee a profile exists
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile


# ---------- PORTFOLIOS ----------


class MyPortfolioListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PortfolioSerializer

    def get_queryset(self):
        return Portfolio.objects.filter(user=self.request.user).order_by(
            "order_index", "id"
        )


class MyPortfolioDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PortfolioSerializer
    lookup_field = "slug"

    def get_queryset(self):
        # ownership enforcement
        return Portfolio.objects.filter(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """
        Delete both the live Portfolio and its associated DraftPortfolio.
        """
        instance = self.get_object()
        slug = instance.slug
        
        # Delete DraftPortfolio if it exists (CASCADE will delete DraftPages)
        try:
            draft = DraftPortfolio.objects.get(slug=slug, user=request.user)
            draft.delete()
        except DraftPortfolio.DoesNotExist:
            pass  # No draft exists, that's fine
        
        # Delete the live Portfolio (CASCADE will delete Pages)
        instance.delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)


class PortfolioPublicListView(generics.ListAPIView):
    """
    Public browse endpoint (no auth)
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = PortfolioSerializer
    queryset = Portfolio.objects.filter(privacy="public").order_by("-updated_at")


# ---------- PAGES ----------


class PageListCreateView(generics.ListCreateAPIView):
    """
    Pages for a given portfolio id (must own it)
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PageSerializer

    def get_queryset(self):
        return Page.objects.filter(
            portfolio__user=self.request.user,
            portfolio_id=self.kwargs["portfolio_id"],
        ).order_by("order", "id")

    def perform_create(self, serializer):
        serializer.save()  # validate_portfolio() enforces ownership


class PageDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PageSerializer

    def get_queryset(self):
        return Page.objects.filter(portfolio__user=self.request.user)
