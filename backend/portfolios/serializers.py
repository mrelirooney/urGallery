from rest_framework import serializers
from .models import Portfolio, Page


class PageSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = [
            "id",
            "title",
            "description",
            "order",
            "layout",
            "media_image",
            "media_shape",
            "created_at",  
        ]


class PortfolioDetailSerializer(serializers.ModelSerializer):
    pages = PageSummarySerializer(many=True, read_only=True)

    class Meta:
        model = Portfolio
        fields = [
            "id",
            "title",
            "slug",
            "privacy",
            "order_index",
            "pages_count",
            "cover_page",
            "pages",
            "created_at",
            "updated_at",
        ]


class PortfolioSerializer(PortfolioDetailSerializer):
    """Backwards-compat alias used by public landing views."""
    pass


class PortfolioUpdateSerializer(serializers.ModelSerializer):
    """Used by the editor to update basic portfolio-level fields."""

    class Meta:
        model = Portfolio
        fields = [
            "title",
            "privacy",
            "order_index",
            "cover_page",
        ]


class PageEditorSerializer(serializers.ModelSerializer):
    """Serializer used by the editor when updating a single page."""

    class Meta:
        model = Page
        fields = [
            "title",
            "description",
            "layout",
            "media_shape",
            "media_image",
        ]
        extra_kwargs = {
            "media_image": {"required": False, "allow_null": True},
        }


class ArtistLandingSerializer(serializers.Serializer):
    """Placeholder for potential future artist landing-specific data."""
    # Extend later if you want extra non-model data here.
    pass


class ArtistProfileSerializer(serializers.Serializer):
    """
    Placeholder serializer for profile data on the artist landing page.

    We keep this as a simple non-model serializer for now to avoid
    tight coupling to accounts.Profile fields. You can replace this with
    a ModelSerializer later when that contract is stable.
    """
    # Example fields you might add later:
    # display_name = serializers.CharField()
    # title = serializers.CharField()
    # location = serializers.CharField()
    # avatar = serializers.ImageField()
    pass
