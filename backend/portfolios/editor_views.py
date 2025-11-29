from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Q
from django.contrib.auth import get_user_model

from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated

from .models import Portfolio, Page, DraftPortfolio, DraftPage
from .serializers import (
    PortfolioDetailSerializer,
    PortfolioUpdateSerializer,
    PageEditorSerializer,
    PageReorderSerializer,
)

User = get_user_model()


def _get_or_create_draft(portfolio_slug: str) -> DraftPortfolio:
    """
    Helper to fetch or create a DraftPortfolio for a given live portfolio slug.
    Always keeps DraftPortfolio.slug in sync with the live Portfolio.slug.
    """
    portfolio = get_object_or_404(Portfolio, slug=portfolio_slug)

    draft, created = DraftPortfolio.objects.get_or_create(
        slug=portfolio.slug,
        defaults={
            "user": portfolio.user,
            "title": portfolio.title,
            "description": portfolio.description,
            "privacy": portfolio.privacy,
            "order_index": portfolio.order_index,
        },
    )

    # If the draft already existed but the live portfolio changed title/slug,
    # keep draft in sync.
    if not created:
        updated = False

        if draft.title != portfolio.title:
            draft.title = portfolio.title
            updated = True

        if draft.slug != portfolio.slug:
            draft.slug = portfolio.slug
            updated = True

        if updated:
            draft.save(update_fields=["title", "slug"])

    # Make sure draft pages exist. If there are none, clone from live pages.
    if not draft.pages.exists():
        for page in portfolio.pages.all().order_by("order", "id"):
            DraftPage.objects.create(
                draft_portfolio=draft,
                title=page.title,
                description=page.description,
                layout=page.layout,
                order=page.order,
                image=page.image,
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


@api_view(["GET", "PATCH", "DELETE"])
@authentication_classes([])
@permission_classes([AllowAny])
def editor_portfolio_detail(request, slug):
    """
    GET:    Return the draft portfolio (creating it from live if needed).
    PATCH:  Update title/description/privacy. Keeps slug synced to title.
    DELETE: Delete the portfolio + its draft.
    """
    if request.method == "GET":
        draft = _get_or_create_draft(slug)
        serializer = PortfolioDetailSerializer(draft)
        return Response(serializer.data)

    # PATCH / DELETE operate on DraftPortfolio as the source of truth
    draft = get_object_or_404(DraftPortfolio, slug=slug)

    if request.method == "PATCH":
        serializer = PortfolioUpdateSerializer(draft, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE
    with transaction.atomic():
        # Delete live portfolio + draft in one go
        portfolio = Portfolio.objects.filter(slug=draft.slug).first()
        if portfolio:
            portfolio.delete()
        draft.delete()

    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "PATCH", "DELETE"])
@authentication_classes([])
@permission_classes([AllowAny])
def editor_update_page(request, slug, page_id):
    """
    GET:    Return a single draft page.
    PATCH:  Update that draft page.
    DELETE: Delete that draft page and normalize orders.
    """
    draft = _get_or_create_draft(slug)
    dpage = get_object_or_404(DraftPage, id=page_id, draft_portfolio=draft)

    if request.method == "GET":
        serializer = PageEditorSerializer(dpage)
        return Response(serializer.data)

    if request.method == "PATCH":
        serializer = PageEditorSerializer(dpage, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE
    dpage.delete()
    _normalize_draft_page_order(draft)
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def editor_create_page(request, slug):
    """
    Create a new draft page at the end of the draft portfolio.
    """
    draft = _get_or_create_draft(slug)

    last_page = draft.pages.all().order_by("-order", "-id").first()
    next_order = (last_page.order + 1) if last_page else 0

    dpage = DraftPage.objects.create(
        draft_portfolio=draft,
        title=request.data.get("title", "New Page"),
        description=request.data.get("description", ""),
        layout=request.data.get("layout", DraftPage.LAYOUT_MEDIA_RIGHT_TEXT_LEFT),
        order=next_order,
        image=None,
    )

    serializer = PageEditorSerializer(dpage)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["PATCH"])
@authentication_classes([])
@permission_classes([AllowAny])
def editor_reorder_pages(request, slug):
    """
    Reorder pages in the draft portfolio.
    Expects: {"page_ids": [id1, id2, id3, ...]}
    """
    draft = _get_or_create_draft(slug)
    page_ids = request.data.get("page_ids", [])

    # Map id -> dpage
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

    serializer = PageReorderSerializer(draft.pages.all().order_by("order", "id"), many=True)
    return Response(serializer.data)


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def publish_portfolio(request, slug):
    """
    Copy the current draft into the live Portfolio, keeping slugs in sync.
    """
    draft = get_object_or_404(DraftPortfolio, slug=slug)

    with transaction.atomic():
        # Get or create the live portfolio with the same slug
        portfolio, _ = Portfolio.objects.get_or_create(
            slug=draft.slug,
            defaults={
                "user": draft.user,
                "title": draft.title,
                "description": draft.description,
                "privacy": draft.privacy,
                "order_index": draft.order_index,
            },
        )

        # If live already existed, sync its fields from the draft
        portfolio.title = draft.title
        portfolio.description = draft.description
        portfolio.privacy = draft.privacy
        portfolio.order_index = draft.order_index
        portfolio.slug = draft.slug  # keep live slug equal to draft slug
        portfolio.save()

        # Replace all live pages with the draft pages
        portfolio.pages.all().delete()

        for dpage in draft.pages.all().order_by("order", "id"):
            Page.objects.create(
                portfolio=portfolio,
                title=dpage.title,
                description=dpage.description,
                layout=dpage.layout,
                order=dpage.order,
                image=dpage.image,
            )

        # Mark draft as having no unpublished changes
        draft.has_unpublished_changes = False
        draft.save(update_fields=["has_unpublished_changes"])

    serializer = PortfolioDetailSerializer(portfolio)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ---------- INTERNAL HELPER ----------

def _get_or_create_draft(portfolio_slug: str) -> DraftPortfolio:
    """
    Return a DraftPortfolio for the given live portfolio slug, creating it (and its pages) if needed.

    IMPORTANT: slug is treated as a *stable technical id* (gallery-1, gallery-2, ...).
    We do NOT change the slug when the title changes.
    """
    portfolio = get_object_or_404(
        Portfolio.objects.select_related("user").prefetch_related("pages"),
        slug=portfolio_slug,
    )

    defaults = {
        "user": portfolio.user,
        "title": portfolio.title,
        # Portfolio.description may be blank; treat missing as ""
        "description": getattr(portfolio, "description", "") or "",
        "privacy": portfolio.privacy,
    }
    if hasattr(portfolio, "order_index"):
        defaults["order_index"] = portfolio.order_index

    draft, created = DraftPortfolio.objects.get_or_create(
        slug=portfolio.slug,
        defaults=defaults,
    )

    # If we just created the draft, clone the live pages into DraftPage
    if created:
        for page in portfolio.pages.all().order_by("order"):
            DraftPage.objects.create(
                draft=draft,
                title=page.title,
                description=page.description,
                layout=page.layout,
                order=page.order,
                image=page.image,
            )

    return draft

# ---------- MAIN EDITOR ENTRYPOINT ----------

@api_view(["GET", "PATCH"])
@permission_classes([AllowAny])
def editor_portfolio_detail(request, slug):
    """
    GET  -> return the draft portfolio (creating it on first access).
    PATCH -> update the draft metadata (title, description, privacy, etc.).
    """
    draft = _get_or_create_draft(slug)

    # Make sure only the owner can access this
    #if draft.user != request.user:
        #return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = PortfolioDetailSerializer(draft, context={"request": request})
        return Response(serializer.data)

    # PATCH – update draft only (slug is stable; do not allow changes)
    serializer = PortfolioDetailSerializer(draft, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        draft.has_unpublished_changes = True
        draft.save(update_fields=["has_unpublished_changes"])
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ---------- PAGE CREATION ----------

@api_view(["POST"])
@permission_classes([AllowAny])
def editor_create_page(request, slug):
    """
    POST -> create a new DraftPage at the end of the draft's page list.
    """
    draft = _get_or_create_draft(slug)

    #if draft.user != request.user:
        #return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    # Determine next order index
    last_page = draft.pages.order_by("-order").first()
    next_order = (last_page.order + 1) if last_page else 0

    data = {
        "title": request.data.get("title") or "Untitled Page",
        "description": request.data.get("description") or "",
        "layout": request.data.get("layout") or "single",
        "order": next_order,
        "draft": draft.id,
    }

    serializer = PageEditorSerializer(data=data)
    if serializer.is_valid():
        page = serializer.save()
        draft.has_unpublished_changes = True
        draft.save(update_fields=["has_unpublished_changes"])
        return Response(PageEditorSerializer(page).data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ---------- PAGE GET / PATCH / DELETE ----------

@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([AllowAny])
def editor_update_page(request, slug, page_id):
    """
    GET    -> return a single DraftPage
    PATCH  -> update a DraftPage
    DELETE -> delete a DraftPage
    """
    draft = _get_or_create_draft(slug)

    #if draft.user != request.user:
        #return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    page = get_object_or_404(DraftPage, id=page_id, draft=draft)

    if request.method == "GET":
        serializer = PageEditorSerializer(page, context={"request": request})
        return Response(serializer.data)

    if request.method == "DELETE":
        page.delete()
        draft.has_unpublished_changes = True
        draft.save(update_fields=["has_unpublished_changes"])
        return Response(status=status.HTTP_204_NO_CONTENT)

    # PATCH
    serializer = PageEditorSerializer(page, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        draft.has_unpublished_changes = True
        draft.save(update_fields=["has_unpublished_changes"])
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ---------- PUBLISH ----------

@api_view(["POST"])
@permission_classes([AllowAny])
def publish_portfolio(request, slug):
    """
    POST -> copy data from DraftPortfolio + DraftPages back to the live Portfolio + Pages.

    Slug is treated as a stable ID; we do NOT change Portfolio.slug here.
    """
    draft = _get_or_create_draft(slug)

    #if draft.user != request.user:
        #return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    portfolio = get_object_or_404(
        Portfolio.objects.select_related("user").prefetch_related("pages"),
        slug=slug,
    )

    with transaction.atomic():
        # 1) Copy top-level fields from draft to live (but NOT slug)
        portfolio.title = draft.title
        if hasattr(portfolio, "description"):
            portfolio.description = draft.description
        portfolio.privacy = draft.privacy
        if hasattr(portfolio, "order_index"):
            portfolio.order_index = draft.order_index
        portfolio.save()

        # 2) Replace live pages with draft pages
        portfolio.pages.all().delete()
        for dpage in draft.pages.all().order_by("order"):
            Page.objects.create(
                portfolio=portfolio,
                title=dpage.title,
                description=dpage.description,
                layout=dpage.layout,
                order=dpage.order,
                image=dpage.image,
            )

        # 3) Mark draft as having no unpublished changes
        draft.has_unpublished_changes = False
        draft.save(update_fields=["has_unpublished_changes"])

    serializer = PortfolioDetailSerializer(portfolio, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)