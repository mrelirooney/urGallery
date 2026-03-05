from rest_framework import serializers
from .models import SavedArtist, SavedPortfolio


class SavedArtistSerializer(serializers.ModelSerializer):
    artist_slug = serializers.CharField(source="profile.slug", read_only=True)
    display_name = serializers.CharField(source="profile.display_name", read_only=True)
    title = serializers.CharField(source="profile.title", read_only=True)
    location = serializers.CharField(source="profile.location", read_only=True)

    class Meta:
        model = SavedArtist
        fields = ["id", "artist_slug", "display_name", "title", "location", "created_at"]
        read_only_fields = fields


class SavedPortfolioSerializer(serializers.ModelSerializer):
    portfolio_slug = serializers.CharField(source="portfolio.slug", read_only=True)
    portfolio_title = serializers.CharField(source="portfolio.title", read_only=True)
    artist_slug = serializers.SerializerMethodField()
    artist_display_name = serializers.SerializerMethodField()

    class Meta:
        model = SavedPortfolio
        fields = [
            "id",
            "portfolio_slug",
            "portfolio_title",
            "artist_slug",
            "artist_display_name",
            "created_at",
        ]
        read_only_fields = fields

    def get_artist_slug(self, obj):
        profile = getattr(obj.portfolio.user, "profile", None)
        return profile.slug if profile else None

    def get_artist_display_name(self, obj):
        profile = getattr(obj.portfolio.user, "profile", None)
        return profile.display_name if profile else None
