# backend/accounts/serializers.py

from rest_framework import serializers

from .models import User, Profile


class UserSerializer(serializers.ModelSerializer):
    """Lightweight user info for nested use in other APIs."""

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
        ]


class ProfileSerializer(serializers.ModelSerializer):
    """
    Public-facing profile data, including a computed avatar_url.

    This is what we'll reuse for:
      - /api/auth/me (later, if we want)
      - /api/artists/<slug>/ (the landing page endpoint)
    """

    user = UserSerializer(read_only=True)
    avatar_url = serializers.SerializerMethodField()
    profile_slug = serializers.CharField(source="profile.slug", read_only=True)

    class Meta:
        model = Profile
        fields = [
            "id",
            "slug",
            "profile_slug", 
            "display_name",
            "title",
            "location",
            "bio",
            "avatar_url",
            "user",
        ]

    def get_avatar_url(self, obj):
        # Uses Profile.get_avatar_url() from your model
        if hasattr(obj, "get_avatar_url"):
            return obj.get_avatar_url()
        return None
    

