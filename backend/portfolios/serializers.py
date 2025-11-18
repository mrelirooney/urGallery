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
            "created_at"
            ]

class PortfolioSummarySerializer(serializers.ModelSerializer):
    pages_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Portfolio
        fields = [
            "id",
            "title",
            "slug",
            "privacy",
            "order_index",
            "pages_count",
            "created_at",
            "updated_at",
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

class PortfolioUpdateSerializer(serializers.ModelSerializer):
    """
    Used by the editor to update basic portfolio fields.
    """
    class Meta:
        model = Portfolio
        fields = [
            "title",
            "privacy",
            "order_index",
            "cover_page",
        ]

class PageEditorSerializer(serializers.ModelSerializer):
    """
    Used by the editor to create/update pages.
    """
    class Meta:
        model = Page
        fields = [
            "id",
            "portfolio",
            "title",
            "description",
            "order",
            "layout",
            "media_image",
            "media_shape",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
