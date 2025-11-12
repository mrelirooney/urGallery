from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Portfolio, Page
from .serializers import PortfolioDetailSerializer, PageSummarySerializer


@api_view(["GET"])
def portfolio_detail(request, slug):
    portfolio = get_object_or_404(
        Portfolio.objects.select_related("user").prefetch_related("pages"),
        slug=slug,
    )
    return Response(PortfolioDetailSerializer(portfolio).data)


@api_view(["GET"])
def portfolio_page_detail(request, slug, page_number: int):
    """
    URL provides 1-based page_number; model uses 0-based 'order'.
    """
    portfolio = get_object_or_404(Portfolio, slug=slug)
    page = get_object_or_404(Page, portfolio=portfolio, order=page_number - 1)
    return Response(PageSummarySerializer(page).data)
