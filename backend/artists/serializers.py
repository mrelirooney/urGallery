# backend/artists/serializers.py

from rest_framework import serializers
from accounts.models import Profile
from config.utils import build_media_url


class ArtistProfileSerializer(serializers.ModelSerializer):
    """
    Minimal profile serializer for the public artist page.
    """
    avatar_url = serializers.SerializerMethodField()
    banner_image_url = serializers.SerializerMethodField()
    resume_url = serializers.SerializerMethodField()
    theme = serializers.SerializerMethodField()

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
            "resume_url",
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
            "theme",
        )

    def get_theme(self, obj):
        """Return theme with svg_url and preview_url for frontend."""
        theme = getattr(obj, "theme", None)
        if not theme:
            return None
        request = self.context.get("request")
        result = {"id": theme.id, "key": theme.key, "name": theme.name}
        if theme.svg_file:
            result["svg_url"] = build_media_url(request, theme.svg_file.url)
        else:
            result["svg_url"] = None
        if theme.preview_image:
            result["preview_url"] = build_media_url(request, theme.preview_image.url)
        else:
            result["preview_url"] = None
        return result

    def get_avatar_url(self, obj):
        """
        Build an absolute URL for the avatar so the frontend can use it directly.
        """
        user = getattr(obj, "user", None)
        avatar = getattr(user, "avatar", None) if user else None
        if not avatar:
            return None
        request = self.context.get("request")
        return build_media_url(request, avatar.url)

    def get_banner_image_url(self, obj):
        """
        Build an absolute URL for the banner image.
        """
        if not obj.banner_image:
            return None
        request = self.context.get("request")
        return build_media_url(request, obj.banner_image.url)

    def get_resume_url(self, obj):
        """
        Build an absolute URL for the resume PDF.
        """
        if not obj.resume_file:
            return None
        request = self.context.get("request")
        return build_media_url(request, obj.resume_file.url)