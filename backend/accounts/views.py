from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    def post(self, request):
        data = request.data
        if User.objects.filter(email=data["email"]).exists():
            return Response({"error": "Email already in use"}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(
            email=data["email"],
            password=data["password"],
        )
        return Response({"detail": "Account created successfully"}, status=status.HTTP_201_CREATED)

class CookieTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        data = response.data

        # Set secure cookies for JWT
        response.set_cookie(
            "access",
            data["access"],
            httponly=True,
            secure=True,  # True for production; False for local testing
            samesite="Lax",
            path="/",
        )
        response.set_cookie(
            "refresh",
            data["refresh"],
            httponly=True,
            secure=True,
            samesite="Lax",
            path="/",
        )

        return Response({"detail": "Login successful"}, status=status.HTTP_200_OK)
