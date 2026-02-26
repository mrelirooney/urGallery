from django.shortcuts import get_object_or_404
from django.http import Http404
from django.db import transaction
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile

from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Portfolio, Page, DraftPortfolio, DraftPage, PortfolioPageLayout
from .serializers import (
    PortfolioDetailSerializer,
    PageEditorSerializer,
    PageReorderSerializer,
    PortfolioEditorSaveSerializer,
    PublicPortfolioSerializer,
)

User = get_user_model()


# ---------- INTERNAL HELPERS ----------


def _get_or_create_draft(slug: str, user) -> DraftPortfolio:
    """
    Get the draft portfolio for this user+slug, or create it from the live portfolio.

    This guarantees that:
    - You only ever edit your own stuff.
    - Drafts are scoped per user and per portfolio slug.
    """
    try:
        draft = DraftPortfolio.objects.get(slug=slug, user=user)
        return draft
    except DraftPortfolio.DoesNotExist:
        pass

    # No draft yet. Look up the live portfolio for THIS user.
    try:
        live = Portfolio.objects.get(slug=slug, user=user)
    except Portfolio.DoesNotExist:
        raise Http404("Portfolio not found for this user")

    draft = DraftPortfolio.objects.create(
        user=live.user,
        slug=live.slug,
        title=live.title,
        description=getattr(live, "description", "") or "",
        privacy=live.privacy,
    )

    # Copy live pages into the draft
    for page in live.pages.all().order_by("order", "id"):
        DraftPage.objects.create(
            draft_portfolio=draft,
            title=page.title,
            description=page.description,
            layout=page.layout,
            media_shape=page.media_shape,
            media_image=page.media_image,  # Copy the image too
            media_shape_2=page.media_shape_2,
            media_image_2=page.media_image_2,
            title_2=page.title_2,
            description_2=page.description_2,
            order=page.order,
        )


    return draft


def _normalize_draft_page_order(draft: DraftPortfolio) -> None:
    """
    Ensure that draft pages have contiguous order values (0,1,2,...).
    """
    pages = list(draft.pages.all().order_by("order", "id"))
    for idx, dpage in enumerate(pages):
        if dpage.order != idx:
            dpage.order = idx
            dpage.save(update_fields=["order"])


def _mark_draft_dirty(draft: DraftPortfolio) -> None:
    """
    Helper to set has_unpublished_changes = True.
    """
    if not draft.has_unpublished_changes:
        draft.has_unpublished_changes = True
        draft.save(update_fields=["has_unpublished_changes"])


# ---------- MAIN EDITOR ENTRYPOINT ----------


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def editor_portfolio_detail(request, slug):
    """
    GET   -> return the draft portfolio (creating it on first access).
    PATCH -> update the draft metadata (title, description, privacy, etc.).
    """
    draft = _get_or_create_draft(slug, request.user)

    # Extra safety: only owner can see their draft
    if draft.user != request.user:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = PortfolioDetailSerializer(draft, context={"request": request})
        return Response(serializer.data)

    # PATCH – update draft portfolio + pages (used by Save Draft)
    # Use PortfolioEditorSaveSerializer to handle nested pages
    serializer = PortfolioEditorSaveSerializer(draft, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        _mark_draft_dirty(draft)
        # Return the full draft with pages using PortfolioDetailSerializer
        response_serializer = PortfolioDetailSerializer(draft, context={"request": request})
        return Response(response_serializer.data)

    # Log validation errors for debugging
    import logging
    logger = logging.getLogger(__name__)
    logger.error(f"Portfolio save validation failed: {serializer.errors}")
    logger.error(f"Request data: {request.data}")
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------- PAGE CREATION ----------


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def editor_create_page(request, slug):
    """
    POST -> create a new DraftPage at the end of the draft's page list.
    """
    draft = _get_or_create_draft(slug, request.user)

    if draft.user != request.user:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    # Determine next order index
    last_page = draft.pages.order_by("-order", "-id").first()
    next_order = (last_page.order + 1) if last_page else 0

    data = {
        "title": request.data.get("title") or "Untitled Page",
        "description": request.data.get("description") or "",
        # Use the PortfolioPageLayout enum for the default layout
        "layout": request.data.get("layout") or PortfolioPageLayout.HERO_LAYOUT_SQUARE_01,
        "order": next_order,
    }

    serializer = PageEditorSerializer(data=data)
    if serializer.is_valid():
        # Pass draft_portfolio as the FK when saving
        page = serializer.save(draft_portfolio=draft)
        _mark_draft_dirty(draft)
        return Response(
            PageEditorSerializer(page, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------- PAGE GET / PATCH / DELETE ----------


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def editor_update_page(request, slug, page_id):
    """
    GET    -> return a single DraftPage
    PATCH  -> update a DraftPage
    DELETE -> delete a DraftPage
    """
    draft = _get_or_create_draft(slug, request.user)

    if draft.user != request.user:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    page = get_object_or_404(DraftPage, id=page_id, draft_portfolio=draft)

    if request.method == "GET":
        serializer = PageEditorSerializer(page, context={"request": request})
        return Response(serializer.data)

    if request.method == "DELETE":
        page.delete()
        _normalize_draft_page_order(draft)
        _mark_draft_dirty(draft)
        return Response(status=status.HTTP_204_NO_CONTENT)

    # PATCH
    serializer = PageEditorSerializer(page, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        _mark_draft_dirty(draft)
        return Response(
            PageEditorSerializer(page, context={"request": request}).data
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------- PAGE REORDER ----------


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def editor_reorder_pages(request, slug):
    """
    Reorder DraftPages inside the draft portfolio.

    Expects JSON:
      { "page_ids": [id1, id2, id3, ...] }
    """
    draft = _get_or_create_draft(slug, request.user)

    if draft.user != request.user:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    page_ids = request.data.get("page_ids", [])

    # Map id -> DraftPage
    dpages = {p.id: p for p in draft.pages.all()}
    order = 0
    for pid in page_ids:
        dpage = dpages.get(pid)
        if not dpage:
            continue
        if dpage.order != order:
            dpage.order = order
            dpage.save(update_fields=["order"])
        order += 1

    _normalize_draft_page_order(draft)
    _mark_draft_dirty(draft)

    # Return the page IDs in their new order
    reordered_pages = draft.pages.all().order_by("order", "id")
    return Response({
        "page_ids": [p.id for p in reordered_pages]
    })


# ---------- PUBLISH ----------


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def publish_portfolio(request, slug):
    """
    POST -> copy data from DraftPortfolio + DraftPages back to the live Portfolio + Pages.

    Slug is treated as a stable ID; we do NOT change Portfolio.slug here.
    """
    try:
        draft = _get_or_create_draft(slug, request.user)

        if draft.user != request.user:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        portfolio = get_object_or_404(
            Portfolio.objects.select_related("user").prefetch_related("pages"),
            slug=slug,
            user=request.user,
        )

        with transaction.atomic():
            # 1) Copy top-level fields from draft to live (but NOT slug)
            portfolio.title = draft.title
            if hasattr(portfolio, "description"):
                portfolio.description = draft.description
            portfolio.privacy = draft.privacy
            portfolio.save()

            # 2) Replace live pages with draft pages
            # Handle case where draft has no pages (empty portfolio)
            portfolio.pages.all().delete()
            for dpage in draft.pages.all().order_by("order", "id"):
                # Create the page first without media (direct assignment doesn't copy
                # files between models with different upload_to paths)
                new_page = Page.objects.create(
                    portfolio=portfolio,
                    title=dpage.title,
                    description=dpage.description,
                    layout=dpage.layout,
                    order=dpage.order,
                    media_image=None,
                    media_shape=dpage.media_shape,
                    media_image_2=None,
                    media_shape_2=dpage.media_shape_2,
                    title_2=dpage.title_2,
                    description_2=dpage.description_2,
                )
                # Explicitly copy media files to the live Page's upload_to path
                if dpage.media_image:
                    new_page.media_image.save(
                        dpage.media_image.name,
                        ContentFile(dpage.media_image.read()),
                        save=True,
                    )
                if dpage.media_image_2:
                    new_page.media_image_2.save(
                        dpage.media_image_2.name,
                        ContentFile(dpage.media_image_2.read()),
                        save=True,
                    )

            # 3) Mark draft as having no unpublished changes
            draft.has_unpublished_changes = False
            draft.save(update_fields=["has_unpublished_changes"])

        # Refresh the portfolio from DB to ensure related pages are loaded
        portfolio.refresh_from_db()
        
        # Return the published portfolio using the public serializer
        serializer = PublicPortfolioSerializer(portfolio, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    except Exception as e:
        import traceback
        error_detail = str(e)
        traceback_str = traceback.format_exc()
        print(f"Error publishing portfolio: {error_detail}")
        print(traceback_str)
        return Response(
            {"detail": f"Error publishing portfolio: {error_detail}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
