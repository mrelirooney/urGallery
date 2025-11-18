from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from .models import Portfolio, Page
from .serializers import PortfolioUpdateSerializer, PageEditorSerializer, PortfolioDetailSerializer


def _get_owned_portfolio_or_404(user, slug: str) -> Portfolio:
    """
    DEV MODE: just get by slug, ignore owner.
    We'll re-lock this to the owner later.
    """
    qs = Portfolio.objects.select_related("user").prefetch_related("pages")
    portfolio = get_object_or_404(qs, slug=slug)
    return portfolio


@api_view(["GET", "PATCH"])
@permission_classes([AllowAny])
def portfolio_editor(request, slug):
    """
    GET  -> return full portfolio detail for the editor
    PATCH -> update portfolio fields (title, privacy, order_index, cover_page)
    """
    portfolio = _get_owned_portfolio_or_404(request.user, slug)
    if portfolio is None:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        data = PortfolioDetailSerializer(portfolio).data
        return Response(data)

    # PATCH
    serializer = PortfolioUpdateSerializer(
        portfolio, data=request.data, partial=True
    )
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def editor_page_create(request, slug):
    """
    POST -> create a new Page in this portfolio.
    Expected body at minimum: { "title": "...", "description": "...", "layout": "...", "order": <int> }
    """
    portfolio = _get_owned_portfolio_or_404(request.user, slug)
    if portfolio is None:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    data = request.data.copy()
    data["portfolio"] = portfolio.id

    serializer = PageEditorSerializer(data=data)
    if serializer.is_valid():
        page = serializer.save()
        return Response(PageEditorSerializer(page).data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH", "DELETE"])
@permission_classes([AllowAny])
def editor_page_detail(request, slug, page_id: int):
    """
    PATCH -> update a single page (title, description, order, layout, media fields)
    DELETE -> delete a page from the portfolio
    """
    portfolio = _get_owned_portfolio_or_404(request.user, slug)
    if portfolio is None:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    page = get_object_or_404(Page, pk=page_id, portfolio=portfolio)

    if request.method == "DELETE":
        page.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # PATCH
    serializer = PageEditorSerializer(page, data=request.data, partial=True)
    if serializer.is_valid():
        page = serializer.save()
        return Response(PageEditorSerializer(page).data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
