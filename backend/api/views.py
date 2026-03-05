from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions, status

from themes.models import Theme
from portfolios.models import Portfolio, DraftPortfolio
from accounts.models import Profile

from .serializers import (
    UserSerializer,
    ThemeSerializer,
    PortfolioSerializer,
    ProfileWriteSerializer,
)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.core.mail import send_mail

from config.utils import build_media_url

from django.contrib.auth import get_user_model
User = get_user_model()


# ---------- THEMES ----------


class ThemeListView(generics.ListAPIView):
    queryset = Theme.objects.filter(is_active=True).order_by("key")
    serializer_class = ThemeSerializer
    permission_classes = [permissions.AllowAny]


# ---------- PROFILE ----------


class MyProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProfileWriteSerializer

    def get_object(self):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile

    def get(self, request, *args, **kwargs):
        profile = self.get_object()
        serializer = self.get_serializer(profile)
        data = serializer.data

        user = profile.user
        data["first_name"] = user.first_name
        data["last_name"] = user.last_name

        if user.avatar:
            try:
                data["avatar_url"] = build_media_url(request, user.avatar.url)
            except Exception:
                data["avatar_url"] = None
        else:
            data["avatar_url"] = None

        if profile.banner_image:
            try:
                data["banner_image_url"] = build_media_url(request, profile.banner_image.url)
            except Exception:
                data["banner_image_url"] = None
        else:
            data["banner_image_url"] = None

        return Response(data)

    def update(self, request, *args, **kwargs):
        profile = self.get_object()
        user = profile.user

        if "avatar" in request.FILES:
            user.avatar = request.FILES["avatar"]
            user.save()

        if "banner_image" in request.FILES:
            profile.banner_image = request.FILES["banner_image"]
            profile.save()

        serializer = self.get_serializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        profile.refresh_from_db()

        response_data = serializer.data
        response_data["first_name"] = user.first_name
        response_data["last_name"] = user.last_name

        if user.avatar:
            try:
                response_data["avatar_url"] = build_media_url(request, user.avatar.url)
            except Exception:
                response_data["avatar_url"] = None
        else:
            response_data["avatar_url"] = None

        if profile.banner_image:
            try:
                response_data["banner_image_url"] = build_media_url(request, profile.banner_image.url)
            except Exception:
                response_data["banner_image_url"] = None
        else:
            response_data["banner_image_url"] = None

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
        return Portfolio.objects.filter(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        slug = instance.slug

        try:
            draft = DraftPortfolio.objects.get(slug=slug, user=request.user)
            draft.delete()
        except DraftPortfolio.DoesNotExist:
            pass

        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ---------- HELP FORM ----------


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def help_form_view(request):
    """
    Send a help/feedback message via email to HELP_EMAIL_RECIPIENT.
    Requires authenticated user.
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
    from_email = user.email or "unknown@urgallery.io"
    sender_label = user.display_name or user.email
    reply_to = reply_email or from_email

    email_subject = subject or "urGallery Help Request"
    email_body = f"From: {sender_label} ({from_email})\n"
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
    except Exception:
        return Response(
            {"detail": "Failed to send message. Please try again later."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response({"detail": "Message sent successfully."}, status=status.HTTP_200_OK)
