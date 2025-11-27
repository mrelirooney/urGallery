from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .models import Portfolio, Page, DraftPortfolio, DraftPage
from .serializers import (
    PortfolioDetailSerializer,
    PortfolioUpdateSerializer,
    PageEditorSerializer,
    PageReorderSerializer,
)


# -------------------------------------------------------------------
# Helpers
# -------------------------------------------------------------------


def _get_or_create_draft(slug: str) -> DraftPortfolio:
    """
    Given a portfolio slug, return the DraftPortfolio.

    If it doesn't exist yet, clone the live Portfolio + its Pages
    into a new DraftPortfolio and DraftPages.

    NOTE: For now this is NOT user-scoped. It just uses the
    Portfolio with the matching slug.
    """
    live = get_object_or_404(Portfolio, slug=slug)

    draft, created = DraftPortfolio.objects.get_or_create(
        user=live.user,
        slug=live.slug,
        defaults={
            "title": live.title,
            # live has no description field, so just start empty
            "description": "",
            "privacy": live.privacy,
        },
    )

    if created and not draft.pages.exists():
        for page in live.pages.all().order_by("order", "id"):
            DraftPage.objects.create(
                draft_portfolio=draft,
                title=page.title,
                description=page.description,
                order=page.order,
                layout=page.layout,
                media_shape=page.media_shape,
                media_image=page.media_image,
            )

    return draft


def _normalize_draft_page_order(draft: DraftPortfolio) -> None:
    """
    Ensure draft.pages have sequential order values starting at 0.
    """
    pages = draft.pages.all().order_by("order", "id")
    for idx, p in enumerate(pages):
        if p.order != idx:
            p.order = idx
            p.save(update_fields=["order"])


# -------------------------------------------------------------------
# Editor portfolio detail (GET = load draft, PATCH = save draft)
# -------------------------------------------------------------------


@api_view(["GET", "PATCH"])
@authentication_classes([])
@permission_classes([AllowAny])
def editor_portfolio_detail(request, slug):
    draft = _get_or_create_draft(slug)

    if request.method == "GET":
        serializer = PortfolioDetailSerializer(draft)
        return Response(serializer.data)

    # PATCH: update draft-level fields and optional pages array
    data = request.data.copy()
    pages_data = data.pop("pages", None)

    serializer = PortfolioUpdateSerializer(draft, data=data, partial=True)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        serializer.save()
        draft.has_unpublished_changes = True
        draft.save(update_fields=["has_unpublished_changes"])

        if pages_data is not None:
            if not isinstance(pages_data, list):
                return Response(
                    {"pages": ["Must be a list of page objects."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Update only existing pages by id
            for page_payload in pages_data:
                page_id = page_payload.get("id")
                if not page_id:
                    continue

                try:
                    dpage = draft.pages.get(id=page_id)
                except DraftPage.DoesNotExist:
                    continue

                changed = False

                for field in ["title", "description", "layout", "media_shape", "order"]:
                    if field in page_payload:
                        setattr(dpage, field, page_payload[field])
                        changed = True

                if changed:
                    dpage.save()

    draft.refresh_from_db()
    out = PortfolioDetailSerializer(draft)
    return Response(out.data)


# -------------------------------------------------------------------
# Editor page create / detail (draft pages)
# -------------------------------------------------------------------


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def editor_create_page(request, slug):
    draft = _get_or_create_draft(slug)

    last_page = draft.pages.all().order_by("-order", "-id").first()
    next_order = (last_page.order + 1) if last_page else 0

    dpage = DraftPage.objects.create(
        draft_portfolio=draft,
        order=next_order,
    )

    draft.has_unpublished_changes = True
    draft.save(update_fields=["has_unpublished_changes"])

    serializer = PageEditorSerializer(dpage)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PATCH", "DELETE"])
@authentication_classes([])
@permission_classes([AllowAny])
def editor_update_page(request, slug, page_id):
    draft = _get_or_create_draft(slug)
    dpage = get_object_or_404(DraftPage, id=page_id, draft_portfolio=draft)

    if request.method == "GET":
        serializer = PageEditorSerializer(dpage)
        return Response(serializer.data)

    if request.method == "PATCH":
        serializer = PageEditorSerializer(dpage, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        draft.has_unpublished_changes = True
        draft.save(update_fields=["has_unpublished_changes"])

        return Response(serializer.data)

    # DELETE
    dpage.delete()
    _normalize_draft_page_order(draft)
    draft.has_unpublished_changes = True
    draft.save(update_fields=["has_unpublished_changes"])

    return Response(status=status.HTTP_204_NO_CONTENT)


# -------------------------------------------------------------------
# Editor reorder pages
# -------------------------------------------------------------------


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def editor_reorder_pages(request, slug):
    draft = _get_or_create_draft(slug)

    serializer = PageReorderSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    order_list = serializer.validated_data["order"]

    with transaction.atomic():
        for idx, page_id in enumerate(order_list):
            try:
                dpage = draft.pages.get(id=page_id)
            except DraftPage.DoesNotExist:
                continue
            if dpage.order != idx:
                dpage.order = idx
                dpage.save(update_fields=["order"])

        _normalize_draft_page_order(draft)
        draft.has_unpublished_changes = True
        draft.save(update_fields=["has_unpublished_changes"])

    draft.refresh_from_db()
    out = PortfolioDetailSerializer(draft)
    return Response(out.data)


# -------------------------------------------------------------------
# Publish draft -> live
# -------------------------------------------------------------------


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def publish_portfolio(request, slug):
    live = get_object_or_404(Portfolio, slug=slug)
    draft = _get_or_create_draft(slug)

    with transaction.atomic():
        # 1) Copy basic fields from draft to live
        live.title = draft.title
        live.privacy = draft.privacy
        live.save(update_fields=["title", "privacy"])

        # 2) Delete existing live pages
        live.pages.all().delete()

        # 3) Recreate live pages from draft pages
        for dpage in draft.pages.all().order_by("order", "id"):
            Page.objects.create(
                portfolio=live,
                title=dpage.title,
                description=dpage.description,
                order=dpage.order,
                layout=dpage.layout,
                media_shape=dpage.media_shape,
                media_image=dpage.media_image,
            )

        # 4) Mark draft as clean
        draft.has_unpublished_changes = False
        draft.save(update_fields=["has_unpublished_changes"])

    return Response(
        {"detail": "Portfolio published successfully."},
        status=status.HTTP_200_OK,
    )
