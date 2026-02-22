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
from django.conf import settings
from django.core.mail import send_mail

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
    
    def get(self, request, *args, **kwargs):
        """Return profile with User fields included"""
        profile = self.get_object()
        serializer = self.get_serializer(profile)
        data = serializer.data
        
        # Add User fields
        user = profile.user
        data['first_name'] = user.first_name
        data['last_name'] = user.last_name
        
        # Add avatar URL if exists
        if user.avatar:
            try:
                data['avatar_url'] = request.build_absolute_uri(user.avatar.url)
            except Exception:
                data['avatar_url'] = None
        else:
            data['avatar_url'] = None
        
        # Add banner image URL if exists
        if profile.banner_image:
            try:
                data['banner_image_url'] = request.build_absolute_uri(profile.banner_image.url)
            except Exception:
                data['banner_image_url'] = None
        else:
            data['banner_image_url'] = None
        
        return Response(data)
    
    def update(self, request, *args, **kwargs):
        """Handle avatar upload, banner upload, and profile update"""
        profile = self.get_object()
        user = profile.user
        
        # Handle avatar upload separately if provided
        if 'avatar' in request.FILES:
            user.avatar = request.FILES['avatar']
            user.save()
        
        # Handle banner image upload separately if provided
        if 'banner_image' in request.FILES:
            profile.banner_image = request.FILES['banner_image']
            profile.save()
        
        # Update profile fields
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Refresh profile to get updated banner_image
        profile.refresh_from_db()
        
        # Return updated data with User fields
        response_data = serializer.data
        response_data['first_name'] = user.first_name
        response_data['last_name'] = user.last_name
        
        if user.avatar:
            try:
                response_data['avatar_url'] = request.build_absolute_uri(user.avatar.url)
            except Exception:
                response_data['avatar_url'] = None
        else:
            response_data['avatar_url'] = None
        
        # Add banner image URL
        if profile.banner_image:
            try:
                response_data['banner_image_url'] = request.build_absolute_uri(profile.banner_image.url)
            except Exception:
                response_data['banner_image_url'] = None
        else:
            response_data['banner_image_url'] = None
        
        return Response(response_data)


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


# ---------- HELP FORM ----------


@api_view(["POST"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def help_form_view(request):
    """
    Send a help/feedback message via email to HELP_EMAIL_RECIPIENT.
    Requires authenticated user. CSRF required.
    """
    message = (request.data.get("message") or "").strip()
    subject = (request.data.get("subject") or "").strip()
    reply_email = (request.data.get("email") or "").strip()

    if not message:
        return Response(
            {"detail": "Message is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(message) > 5000:
        return Response(
            {"detail": "Message is too long."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = request.user
    from_email = getattr(user, "email", "") or "unknown@urgallery.io"
    reply_to = reply_email or from_email

    email_subject = subject or "urGallery Help Request"
    email_body = f"From: {user.username} ({from_email})\n"
    if reply_to != from_email:
        email_body += f"Reply-to preferred: {reply_to}\n"
    email_body += f"\n--- Message ---\n\n{message}"

    recipient = getattr(settings, "HELP_EMAIL_RECIPIENT", "mrelirooney@gmail.com")
    try:
        send_mail(
            subject=f"[urGallery Help] {email_subject}",
            message=email_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient],
            fail_silently=False,
        )
    except Exception as e:
        return Response(
            {"detail": "Failed to send message. Please try again later."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response({"detail": "Message sent successfully."}, status=status.HTTP_200_OK)
