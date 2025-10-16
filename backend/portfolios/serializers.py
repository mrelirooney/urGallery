from rest_framework import serializers
from accounts.models import Profile
from .models import Portfolio, Page

# --- Page ----
class PageCoverSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField(allow_blank=True)
    url = serializers.CharField(allow_null=True)
    cover_image = serializers.CharField(allow_null=True)

class PageSerializer(serializers.ModelSerializer):
    cover = serializers.SerializerMethodField()

    class Meta:
        model = Page
        fields = ("id", "title", "description", "layout", "order", "cover")

    def get_cover(self, obj):
        pm = obj.page_media.order_by("order", "id").select_related("media").first()
        if not pm:
            return None
        m = pm.media
        return PageCoverSerializer({
            "id": m.id,
            "title": m.title or "",
            "url": m.external_url or (m.file.url if m.file else None),
            "cover_image": m.cover_image.url if m.cover_image else None,
        }).data

# --- Portfolio ----
class PortfolioSerializer(serializers.ModelSerializer):
    first_page = serializers.SerializerMethodField()

    class Meta:
        model = Portfolio
        fields = ("id", "slug", "title", "privacy", "order_index", "pages_count", "first_page")

    def get_first_page(self, obj):
        page = obj.pages.order_by("order", "id").first()
        return PageSerializer(page).data if page else None

# --- Profile (header) ----
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = (
            "display_name", "title", "location", "bio",
            "avatar_s3_key", "website_url", "instagram_url", "twitter_url",
            "behance_url", "dribbble_url", "youtube_url", "tiktok_url",
        )

# --- Top-level payload ----
class ArtistLandingSerializer(serializers.Serializer):
    profile = ProfileSerializer()
    portfolios = PortfolioSerializer(many=True)
