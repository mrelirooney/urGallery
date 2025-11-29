from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Portfolio, Page, Privacy
from .serializers import PortfolioSerializer, PublicPageSummarySerializer


@api_view(["GET"])
def portfolio_detail(request, slug):
    """
    Public: return a full portfolio with its pages (read-only).

    - PUBLIC: visible to everyone
    - LINK_ONLY: visible to anyone with the link
    - DRAFT: only visible to the owner
    """
    portfolio = get_object_or_404(
        Portfolio.objects.select_related("user").prefetch_related("pages"),
        slug=slug,
    )

    if portfolio.privacy == Privacy.DRAFT:
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated or user != portfolio.user:
            return Response({"detail": "Not found."}, status=404)

    serializer = PortfolioSerializer(portfolio, context={"request": request})
    return Response(serializer.data)
