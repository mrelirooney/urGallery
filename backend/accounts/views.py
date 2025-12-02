from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from rest_framework import generics
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from .models import Profile
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer



User = get_user_model()

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    SimpleJWT serializer that uses `email` instead of `username`
    as the login identifier.
    """
    username_field = "email"

class CookieTokenObtainPairView(TokenObtainPairView):
    """
    Custom login endpoint that stores tokens in HttpOnly cookies
    instead of returning them in the JSON body.
    """
    permission_classes = [AllowAny]
    serializer_class = EmailTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        # 1️ Use the regular SimpleJWT serializer to validate user credentials
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # 2️ Build the response object
        response = Response({"message": "Login successful"}, status=status.HTTP_200_OK)

        # 3️ Set HttpOnly cookies (these are the lines you asked about)
        response.set_cookie(
            key="access",
            value=data["access"],
            httponly=True,
            secure=False,      # True only in production (HTTPS)
            samesite="Lax",
            path="/"
        )
        response.set_cookie(
            key="refresh",
            value=data["refresh"],
            httponly=True,
            secure=False,
            samesite="Lax",
            path="/"
        )

        return response


class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        data = response.data
        secure_flag = False    # PROD: True on HTTPS

        if "access" in data:
            response.set_cookie(
                "access", data["access"],
                httponly=True, samesite="Lax", secure=secure_flag, path="/"
            )
        # If you also return refresh on rotation, set that too:
        if "refresh" in data:
            response.set_cookie(
                "refresh", data["refresh"],
                httponly=True, samesite="Lax", secure=secure_flag, path="/"
            )
        return response
    
class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        data = request.data
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return Response({"error": "email and password are required"}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already in use"}, status=400)

        User.objects.create_user(email=email, password=password)
        return Response({"detail": "Account created successfully"}, status=status.HTTP_201_CREATED)
    
class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = user.profile  # ← from Profile model

        # --- avatar logic ---
        # 1) Prefer the uploaded avatar file on the User model
        if user.avatar:
            try:
                avatar_url = request.build_absolute_uri(user.avatar.url)
            except Exception:
                avatar_url = None
        # 2) Fallbacks: custom S3 key or default avatar from Profile
        elif profile.avatar_s3_key:
            avatar_url = profile.avatar_s3_key
        elif profile.default_avatar:
            avatar_url = profile.default_avatar.s3_key
        else:
            avatar_url = None

        return Response({
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,

            # MOST IMPORTANT FIELDS
            "slug": profile.slug,
            "display_name": profile.display_name,
            "title": profile.title,
            "location": profile.location,
            "bio": profile.bio,

            # avatar for navbar
            "avatar_url": avatar_url,
        })
    
class LogoutView(APIView):
    def post(self, request):
        resp = Response({"detail": "Logged out"}, status=status.HTTP_200_OK)
        # clear both cookies (works across browsers)
        for name in ("access", "refresh"):
            resp.delete_cookie(name, path="/")
            resp.set_cookie(name, "", expires=0, path="/", samesite="Lax")
        return resp

@ensure_csrf_cookie
@api_view(["GET"])
@permission_classes([AllowAny])
def csrf_cookie_view(request):
    """
    Simple endpoint that sets the CSRF cookie (csrftoken).
    Frontend calls this once so future POSTs can include X-CSRFToken.
    """
    return Response({"detail": "CSRF cookie set"})

