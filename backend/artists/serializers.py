# backend/artists/serializers.py

from rest_framework import serializers
from accounts.models import Profile

class ArtistProfileSerializer(serializers.ModelSerializer):
    """
    Minimal profile serializer for the public artist page.
    """
    avatar_url = serializers.SerializerMethodField()
    banner_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = (
            "slug",
            "display_name",
            "title",
            "location",
            "bio",
            "avatar_url",
            "banner_image_url",
            "website_url",
            "instagram_url",
            "twitter_url",
            "behance_url",
            "dribbble_url",
            "youtube_url",
            "tiktok_url",
            "linkedin_url",
            "twitch_url",
            "email_contact",
            "contact_order",
            "background_color",
            "foreground_color",
            "text_color",
            "accent_color",
            "font_family",
        )

    def get_avatar_url(self, obj):
        """
        Build an absolute URL for the avatar so the frontend can use it directly.
        """
        # fallback to user.avatar
        user = getattr(obj, "user", None)
        avatar = getattr(user, "avatar", None) if user else None
        if not avatar:
            return None

        request = self.context.get("request")
        url = avatar.url
        return request.build_absolute_uri(url) if request else url
    
    def get_banner_image_url(self, obj):
        """
        Build an absolute URL for the banner image.
        """
        if not obj.banner_image:
            return None
        
        request = self.context.get("request")
        url = obj.banner_image.url
        return request.build_absolute_uri(url) if request else url