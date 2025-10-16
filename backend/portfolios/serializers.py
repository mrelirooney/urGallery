from rest_framework import serializers
from accounts.models import Profile
from .models import Portfolio, Page
from django.conf import settings


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
  
class ArtistProfileSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    class Meta:
        model = Profile
        fields = (
            "display_name", "title", "location", "bio",
            "avatar_s3_key", "avatar_url", "website_url", "instagram_url", "twitter_url",
            "behance_url", "dribbble_url", "youtube_url", "tiktok_url",
        )

    def get_avatar_url(self, obj):
        # 1) Explicit S3 key on profile (your future flow)
        if obj.avatar_s3_key:
            # if you’re storing a full https URL, just return it
            if obj.avatar_s3_key.startswith("http"):
                return obj.avatar_s3_key
            # else treat it like a media key in dev
            return f"{settings.MEDIA_URL}{obj.avatar_s3_key}"

        # 2) Image uploaded on the related user (what you just did in Admin)
        user = getattr(obj, "user", None)
        if user and getattr(user, "avatar", None):
            try:
                return user.avatar.url  # Django builds /media/... path
            except Exception:
                pass

        # 3) Optional default avatar stored as an S3 key/path
        if obj.default_avatar and obj.default_avatar.s3_key:
            if obj.default_avatar.s3_key.startswith("http"):
                return obj.default_avatar.s3_key
            return f"{settings.MEDIA_URL}{obj.default_avatar.s3_key}"

        return None

# --- Top-level payload ----
class ArtistLandingSerializer(serializers.Serializer):
    profile = ArtistProfileSerializer()
    portfolios = PortfolioSerializer(many=True)
