from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Portfolio, Page
from .serializers import PortfolioDetailSerializer, PageSummarySerializer


@api_view(["GET"])
def portfolio_detail(request, slug):
    """Public: return a full portfolio with its pages (read-only)."""
    portfolio = get_object_or_404(
        Portfolio.objects.select_related("user").prefetch_related("pages"),
        slug=slug,
    )
    serializer = PortfolioDetailSerializer(portfolio, context={"request": request})
    return Response(serializer.data)


@api_view(["GET"])
def portfolio_page_detail(request, slug, page_number: int):
    """Public: return a single page within a portfolio by page_number (1-based)."""
    portfolio = get_object_or_404(Portfolio, slug=slug)
    pages_qs = portfolio.pages.order_by("order")

    try:
        page = pages_qs[page_number - 1]
    except IndexError:
        return Response({"detail": "Page not found."}, status=404)

    serializer = PageSummarySerializer(page, context={"request": request})
    return Response(serializer.data)
