from rest_framework import serializers
from .models import (
    Portfolio,
    Page,
    DraftPortfolio,
    DraftPage,
)


# -------------------------------------------------------------------
# Draft-side serializers used by the editor
# -------------------------------------------------------------------


class PageSummarySerializer(serializers.ModelSerializer):
    """
    Used inside the editor portfolio payload to show a list of draft pages.
    """

    class Meta:
        model = DraftPage
        fields = [
            "id",
            "title",
            "description",
            "order",
            "layout",
            "media_image",
            "media_shape",
            "created_at",
            "updated_at",
        ]


class PortfolioDetailSerializer(serializers.ModelSerializer):
    """
    Editor view of a DraftPortfolio + its DraftPages.
    """
    pages = PageSummarySerializer(many=True, read_only=True)

    class Meta:
        model = DraftPortfolio
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "privacy",
            "has_unpublished_changes",
            "created_at",
            "updated_at",
            "pages",
        ]


class PortfolioUpdateSerializer(serializers.ModelSerializer):
    """
    Used by the editor to update basic draft-level fields.
    """

    class Meta:
        model = DraftPortfolio
        fields = [
            "title",
            "description",
            "privacy",
        ]


class PageEditorSerializer(serializers.ModelSerializer):
    """
    Serializer used by the editor when working on a single draft page.
    """

    class Meta:
        model = DraftPage
        fields = [
            "id",
            "title",
            "description",
            "order",
            "layout",
            "media_shape",
            "media_image",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {
            "media_image": {"required": False, "allow_null": True},
        }


class PageReorderSerializer(serializers.Serializer):
    """
    Used by the editor to validate a page reorder payload.

    Expected shape:
    {
        "order": [3, 1, 5, 2]
    }
    where each value is a DraftPage.id in the new order.
    """
    order = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False,
    )


# -------------------------------------------------------------------
# Public-facing serializers (live site)
# -------------------------------------------------------------------


class PublicPageSummarySerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for LIVE Page rows, used on the public site.
    """

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


class PortfolioSerializer(serializers.ModelSerializer):
    """
    Serializer for LIVE Portfolio objects (public landing etc.).
    """
    pages = PublicPageSummarySerializer(many=True, read_only=True)

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
            "created_at",
            "updated_at",
            "pages",
        ]

        read_only_fields = ["slug"]


class ArtistLandingSerializer(serializers.Serializer):
    """Placeholder for potential future artist landing-specific data."""
    pass


class ArtistProfileSerializer(serializers.Serializer):
    """
    Placeholder serializer for profile data on the artist landing page.
    """
    pass

class PublicPageSerializer(serializers.ModelSerializer):
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

class PublicPortfolioSerializer(serializers.ModelSerializer):
    pages = PublicPageSerializer(many=True, read_only=True)

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
            "created_at",
            "updated_at",
            "pages",
        ]
        read_only_fields = ["slug"]

