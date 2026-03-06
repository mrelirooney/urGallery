from rest_framework import serializers
from config.utils import build_media_url
from .models import SavedArtist, SavedPortfolio


class SavedArtistSerializer(serializers.ModelSerializer):
    artist_slug = serializers.CharField(source="profile.slug", read_only=True)
    display_name = serializers.CharField(source="profile.display_name", read_only=True)
    title = serializers.CharField(source="profile.title", read_only=True)
    location = serializers.CharField(source="profile.location", read_only=True)
    avatar_url = serializers.SerializerMethodField()
    background_color = serializers.CharField(source="profile.background_color", read_only=True)
    text_color = serializers.CharField(source="profile.text_color", read_only=True)
    accent_color = serializers.CharField(source="profile.accent_color", read_only=True)

    class Meta:
        model = SavedArtist
        fields = [
            "id",
            "artist_slug",
            "display_name",
            "title",
            "location",
            "avatar_url",
            "background_color",
            "text_color",
            "accent_color",
            "created_at",
        ]
        read_only_fields = fields

    def get_avatar_url(self, obj):
        user = getattr(obj.profile, "user", None)
        avatar = getattr(user, "avatar", None) if user else None
        if avatar:
            request = self.context.get("request")
            return build_media_url(request, avatar.url)
        return None


class SavedPortfolioSerializer(serializers.ModelSerializer):
    portfolio_slug = serializers.CharField(source="portfolio.slug", read_only=True)
    portfolio_title = serializers.CharField(source="portfolio.title", read_only=True)
    artist_slug = serializers.SerializerMethodField()
    artist_display_name = serializers.SerializerMethodField()
    cover_image_url = serializers.SerializerMethodField()
    background_color = serializers.SerializerMethodField()
    text_color = serializers.SerializerMethodField()
    accent_color = serializers.SerializerMethodField()

    class Meta:
        model = SavedPortfolio
        fields = [
            "id",
            "portfolio_slug",
            "portfolio_title",
            "artist_slug",
            "artist_display_name",
            "cover_image_url",
            "background_color",
            "text_color",
            "accent_color",
            "created_at",
        ]
        read_only_fields = fields

    def get_artist_slug(self, obj):
        profile = getattr(obj.portfolio.user, "profile", None)
        return profile.slug if profile else None

    def get_artist_display_name(self, obj):
        profile = getattr(obj.portfolio.user, "profile", None)
        return profile.display_name if profile else None

    def get_cover_image_url(self, obj):
        portfolio = obj.portfolio
        page = portfolio.cover_page or portfolio.pages.order_by("order").first()
        if not page:
            return None
        img = page.media_image or page.media_image_2
        if not img:
            return None
        request = self.context.get("request")
        return build_media_url(request, img.url)

    def _get_profile_colors(self, obj):
        profile = getattr(obj.portfolio.user, "profile", None)
        if not profile:
            return None, None, None
        return (
            profile.background_color or "#faf7f2",
            profile.text_color or "#11100e",
            profile.accent_color or "#c96a4a",
        )

    def get_background_color(self, obj):
        return self._get_profile_colors(obj)[0]

    def get_text_color(self, obj):
        return self._get_profile_colors(obj)[1]

    def get_accent_color(self, obj):
        return self._get_profile_colors(obj)[2]
