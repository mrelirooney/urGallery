from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from rest_framework import generics
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

User = get_user_model()

class CookieTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        # Get the normal SimpleJWT response (contains {"access": "...", "refresh": "..."})
        response = super().post(request, *args, **kwargs)
        data = response.data

        # DEV: cookies must be secure=False on http://localhost
        secure_flag = False    # PROD: True on HTTPS

        # Set httpOnly cookies
        response.set_cookie(
            "access", data["access"],
            httponly=True, samesite="Lax", secure=secure_flag, path="/"
        )
        response.set_cookie(
            "refresh", data["refresh"],
            httponly=True, samesite="Lax", secure=secure_flag, path="/"
        )

        # (Optional) remove tokens from the JSON body
        response.data = {"detail": "ok"}
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
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        u = request.user
        return Response({
            "id": str(u.id),
            "email": getattr(u, "email", ""),
            "first_name": getattr(u, "first_name", ""),
            "last_name": getattr(u, "last_name", ""),
        })
