from typing import Optional

from django.db import models
from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status


from .models import Portfolio, Page
from .serializers import (
    PortfolioDetailSerializer,
    PortfolioUpdateSerializer,
    PageEditorSerializer,
    PageSummarySerializer,
)


def _get_portfolio_for_editor(slug: str) -> Portfolio:
    """Helper to fetch a portfolio for the editor.

    DEV MODE: we ignore the request.user and just fetch by slug.
    Later you can lock this down to the owner.
    """
    qs = Portfolio.objects.select_related("user").prefetch_related("pages")
    return get_object_or_404(qs, slug=slug)


def _get_page_by_number(portfolio: Portfolio, page_number: int) -> Optional[Page]:
    pages_qs = portfolio.pages.order_by("order")
    try:
        return pages_qs[page_number - 1]
    except IndexError:
        return None


def _normalize_page_order(portfolio: Portfolio) -> None:
    """Ensure page.order values are contiguous after deletions."""
    for idx, page in enumerate(portfolio.pages.order_by("order")):
        if page.order != idx:
            page.order = idx
            page.save(update_fields=["order"])


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([AllowAny])
def portfolio_editor_detail(request, slug):
    """Editor: retrieve, update, or delete portfolio details."""
    portfolio = _get_portfolio_for_editor(slug)

    if request.method == "GET":
        serializer = PortfolioDetailSerializer(
            portfolio, context={"request": request}
        )
        return Response(serializer.data)

    if request.method == "PATCH":
        # 1. Handle title updates using the existing serializer logic
        serializer = PortfolioUpdateSerializer(
            portfolio, data=request.data, partial=True
        )
        if serializer.is_valid():
            portfolio = serializer.save()
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # 2. Handle the 'action' field for Draft/Publish/Privacy status
        action = request.data.get("action")
        
        # NOTE: We assume your Portfolio model has a 'privacy' field
        # that uses string choices like "DRAFT", "PUBLIC", "LINK_ONLY"
        
        if action == "draft":
            portfolio.privacy = "DRAFT"
            portfolio.save(update_fields=["privacy"])
            
        elif action == "publish":
            portfolio.privacy = "PUBLIC"
            portfolio.save(update_fields=["privacy"])
            
        elif action == "privacy":
            # For 'Privacy', we will toggle between 'PUBLIC' and 'LINK_ONLY' for public-facing portfolios
            # If the current state is DRAFT, we assume they want to make it public, but link-only.
            if portfolio.privacy == "PUBLIC":
                portfolio.privacy = "LINK_ONLY"
            elif portfolio.privacy == "LINK_ONLY":
                portfolio.privacy = "PUBLIC"
            else: # If DRAFT, set to LINK_ONLY as a safe default
                portfolio.privacy = "LINK_ONLY"
            
            portfolio.save(update_fields=["privacy"])

        # 3. Return the updated portfolio data
        out = PortfolioDetailSerializer(portfolio, context={"request": request})
        return Response(out.data)

    if request.method == "DELETE":
        # Delete portfolio logic (optional, but good practice)
        portfolio.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    # Fallback for unhandled methods (though @api_view handles it)
    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(["POST"])
@permission_classes([AllowAny])
def portfolio_editor_page_create(request, slug):
    """Editor: create a new page in the portfolio."""
    portfolio = _get_portfolio_for_editor(slug)
    
    # Find the highest order value and add 1
    max_order = portfolio.pages.aggregate(models.Max("order"))["order__max"]
    next_order = (max_order + 1) if max_order is not None else 0
    
    # Create the new page with defaults
    page = Page.objects.create(
        portfolio=portfolio,
        title=f"Page {next_order + 1}",
        description="",
        order=next_order,
        layout="MediaLeft_TextRight",  # default layout
        media_shape="1:1",  # default shape
    )
    
    # Return the newly created page
    serializer = PageSummarySerializer(page, context={"request": request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([AllowAny])
def portfolio_editor_page_detail(request, slug, page_number: int):
    """Editor: view / update / delete a single page by its number."""
    portfolio = _get_portfolio_for_editor(slug)
    page = _get_page_by_number(portfolio, page_number)
    if page is None:
        return Response(
            {"detail": "Page not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "GET":
        serializer = PageEditorSerializer(page, context={"request": request})
        return Response(serializer.data)

    if request.method == "PATCH":
        serializer = PageEditorSerializer(
            page, data=request.data, partial=True
        )
        if serializer.is_valid():
            page = serializer.save()
            out = PageEditorSerializer(page, context={"request": request})
            return Response(out.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE
    page.delete()
    _normalize_page_order(portfolio)
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(["PATCH"]) # We only allow PATCH requests for reordering
@permission_classes([AllowAny])
def portfolio_editor_reorder_pages(request, slug):
    """Editor: update the order of pages in the portfolio."""
    if request.method != "PATCH":
        # Should not happen if we only allow PATCH, but good practice
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    # The frontend sends a list of page IDs in the new, desired order:
    # {"page_ids": [id1, id2, id3, ...]}
    page_ids = request.data.get("page_ids")

    if not isinstance(page_ids, list):
        return Response(
            {"detail": "Expected 'page_ids' as a list."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    portfolio = _get_portfolio_for_editor(slug)
    
    # Use a transaction to ensure all order updates happen together
    with transaction.atomic():
        
        # We need to map the incoming IDs to actual Page objects to ensure they belong to this portfolio
        page_map = {
            page.id: page
            for page in portfolio.pages.all()
        }

        # List to hold pages we will update
        pages_to_update = []
        
        # Iterate through the submitted order, assigning a new order index (starting at 0)
        for index, page_id in enumerate(page_ids):
            page = page_map.get(page_id)
            
            if page is None:
                # If an ID is submitted that doesn't belong to this portfolio, raise an error
                raise ValueError(f"Page ID {page_id} not found in portfolio.")

            # Assign the new order based on its index in the submitted list
            if page.order != index:
                page.order = index
                pages_to_update.append(page)

        # Bulk update the order field for all changed pages
        Page.objects.bulk_update(pages_to_update, ["order"])
        
        # Note: If you ever implement pagination or slicing on the frontend, 
        # you might need to call _normalize_page_order here, but for simple reordering,
        # bulk_update is more efficient.

    return Response(
        {"detail": "Page order updated successfully."},
        status=status.HTTP_200_OK,
    )