from rest_framework import serializers
from config.utils import build_media_url
from .models import (
    Portfolio,
    Page,
    DraftPortfolio,
    DraftPage,
    Comment,
)


# -------------------------------------------------------------------
# Draft-side serializers used by the editor
# -------------------------------------------------------------------


class PageSummarySerializer(serializers.ModelSerializer):
    """
    Used inside the editor portfolio payload to show a list of draft pages.
    """
    media_image = serializers.SerializerMethodField()
    media_image_2 = serializers.SerializerMethodField()

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
            "media_image_2",
            "media_shape_2",
            "title_2",
            "description_2",
            "created_at",
            "updated_at",
        ]

    def get_media_image(self, obj):
        if not obj.media_image:
            return None
        request = self.context.get("request")
        return build_media_url(request, obj.media_image.url)

    def get_media_image_2(self, obj):
        if not obj.media_image_2:
            return None
        request = self.context.get("request")
        return build_media_url(request, obj.media_image_2.url)


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

EditorPortfolioSerializer = PortfolioDetailSerializer

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
    Uses ImageField for write (PATCH with FormData), to_representation for read (relative URLs).
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
            "media_shape_2",
            "media_image_2",
            "title_2",
            "description_2",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {
            "media_image": {"required": False, "allow_null": True},
            "media_image_2": {"required": False, "allow_null": True},
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        data["media_image"] = (
            build_media_url(request, instance.media_image.url)
            if instance.media_image
            else None
        )
        data["media_image_2"] = (
            build_media_url(request, instance.media_image_2.url)
            if instance.media_image_2
            else None
        )
        return data


class PageEditorInputSerializer(serializers.Serializer):
    """
    Serializer for accepting page data from the frontend during bulk save.
    Note: id can be an integer (existing page) or a string UUID (new page from frontend).
    """
    id = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    title = serializers.CharField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    layout = serializers.CharField(required=False)
    media_shape = serializers.CharField(required=False)
    media_shape_2 = serializers.CharField(required=False, allow_blank=True)
    title_2 = serializers.CharField(required=False, allow_blank=True)
    description_2 = serializers.CharField(required=False, allow_blank=True)
    order = serializers.IntegerField(required=False)


class PortfolioEditorSaveSerializer(serializers.ModelSerializer):
    """
    Serializer that accepts nested pages for bulk save.
    Used by Save Draft to save portfolio + all pages in one request.
    """
    pages = PageEditorInputSerializer(many=True, required=False)
    
    class Meta:
        model = DraftPortfolio
        fields = ["title", "description", "privacy", "pages"]
    
    def validate_privacy(self, value):
        """Ensure privacy value is valid."""
        from portfolios.models import Privacy
        valid_choices = [choice[0] for choice in Privacy.choices]
        if value not in valid_choices:
            raise serializers.ValidationError(
                f"Invalid privacy value. Must be one of: {', '.join(valid_choices)}"
            )
        return value
    
    def update(self, instance, validated_data):
        pages_data = validated_data.pop("pages", None)
        
        # Update portfolio-level fields
        instance.title = validated_data.get("title", instance.title)
        instance.description = validated_data.get("description", instance.description)
        instance.privacy = validated_data.get("privacy", instance.privacy)
        instance.save()
        
        # Update/create/delete pages if provided
        # Note: pages_data can be None (not provided), [] (empty array), or [pages...]
        if pages_data is not None:
            # Get existing page IDs
            existing_pages = {p.id: p for p in instance.pages.all()}
            incoming_ids = {p.get("id") for p in pages_data if p.get("id") is not None}
            
            # Delete pages that are no longer in the list
            to_delete_ids = set(existing_pages.keys()) - incoming_ids
            if to_delete_ids:
                instance.pages.filter(id__in=to_delete_ids).delete()
            
            # Update or create pages (handle empty array case)
            for idx, page_data in enumerate(pages_data):
                page_id_raw = page_data.get("id")
                
                # Convert page_id to integer if possible; string UUIDs mean "new page"
                page_id = None
                if page_id_raw:
                    try:
                        page_id = int(page_id_raw)
                    except (ValueError, TypeError):
                        # String UUID from frontend = new page, treat as None
                        page_id = None
                
                # Use order from array position if not provided
                page_order = page_data.get("order", idx)
                
                # Validate layout value if provided
                layout_value = page_data.get("layout")
                if layout_value:
                    from portfolios.models import PortfolioPageLayout
                    valid_layouts = [choice[0] for choice in PortfolioPageLayout.choices]
                    if layout_value not in valid_layouts:
                        # Default to a valid layout if invalid
                        layout_value = PortfolioPageLayout.HERO_LAYOUT_SQUARE_01
                
                # Validate media_shape if provided
                media_shape_value = page_data.get("media_shape", "1:1")
                from portfolios.models import MEDIA_SHAPE_CHOICES
                valid_shapes = [choice[0] for choice in MEDIA_SHAPE_CHOICES]
                if media_shape_value not in valid_shapes:
                    media_shape_value = "1:1"  # Default
                
                if page_id and page_id in existing_pages:
                    # Update existing page
                    page = existing_pages[page_id]
                    # Only update fields that are provided in the payload
                    if "title" in page_data:
                        page.title = page_data.get("title", "Untitled Page")
                    if "description" in page_data:
                        page.description = page_data.get("description", "")
                    if layout_value:
                        page.layout = layout_value
                    if "media_shape" in page_data:
                        page.media_shape = media_shape_value
                    if "media_shape_2" in page_data:
                        page.media_shape_2 = page_data.get("media_shape_2", "1:1")
                    if "title_2" in page_data:
                        page.title_2 = page_data.get("title_2", "")
                    if "description_2" in page_data:
                        page.description_2 = page_data.get("description_2", "")
                    page.order = page_order
                    page.save()
                else:
                    # Create new page (frontend might send pages with IDs that don't exist yet)
                    DraftPage.objects.create(
                        draft_portfolio=instance,
                        title=page_data.get("title", "Untitled Page"),
                        description=page_data.get("description", ""),
                        layout=layout_value or "HeroLayoutSquare01",
                        media_shape=media_shape_value,
                        media_shape_2=page_data.get("media_shape_2", "1:1"),
                        title_2=page_data.get("title_2", ""),
                        description_2=page_data.get("description_2", ""),
                        order=page_order,
                    )
            
            # Normalize order to ensure contiguous values (0, 1, 2, ...)
            pages = list(instance.pages.all().order_by("order", "id"))
            for idx, dpage in enumerate(pages):
                if dpage.order != idx:
                    dpage.order = idx
                    dpage.save(update_fields=["order"])
        
        return instance


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
            "media_image_2",
            "media_shape_2",
            "title_2",
            "description_2",
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


class PublicPageSerializer(serializers.ModelSerializer):
    media_image = serializers.SerializerMethodField()
    media_image_2 = serializers.SerializerMethodField()

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
            "media_image_2",
            "media_shape_2",
            "title_2",
            "description_2",
            "created_at",
        ]

    def get_media_image(self, obj):
        if not obj.media_image:
            return None
        request = self.context.get("request")
        return build_media_url(request, obj.media_image.url)

    def get_media_image_2(self, obj):
        if not obj.media_image_2:
            return None
        request = self.context.get("request")
        return build_media_url(request, obj.media_image_2.url)

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


# -------------------------------------------------------------------
# Comments
# -------------------------------------------------------------------


class CommentSerializer(serializers.ModelSerializer):
    author_display_name = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ["id", "body", "author_display_name", "created_at"]
        read_only_fields = ["id", "author_display_name", "created_at"]

    def get_author_display_name(self, obj):
        profile = getattr(obj.author, "profile", None)
        if profile:
            return profile.display_name or obj.author.email
        return obj.author.email

