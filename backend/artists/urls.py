# artists/urls.py
# All public artist and portfolio routes.
# Mounted at /api/artists/ in api/urls.py.

from django.urls import path
from .api import search_artists
from .views import (
    ArtistLandingView,
    ArtistPortfolioDetailView,
    PortfolioCommentListCreateView,
    PortfolioCommentDeleteView,
)

urlpatterns = [
    # GET /api/artists/search/?q=<term>
    path("search/", search_artists, name="search-artists"),

    # GET /api/artists/<artist_slug>/
    path("<slug:slug>/", ArtistLandingView.as_view(), name="artist-landing"),

    # GET /api/artists/<artist_slug>/portfolios/<portfolio_slug>/
    path(
        "<slug:artist_slug>/portfolios/<slug:slug>/",
        ArtistPortfolioDetailView.as_view(),
        name="artist-portfolio-detail",
    ),

    # GET/POST /api/artists/<artist_slug>/portfolios/<portfolio_slug>/comments/
    path(
        "<slug:artist_slug>/portfolios/<slug:slug>/comments/",
        PortfolioCommentListCreateView.as_view(),
        name="portfolio-comments",
    ),

    # DELETE /api/artists/<artist_slug>/portfolios/<portfolio_slug>/comments/<id>/
    path(
        "<slug:artist_slug>/portfolios/<slug:slug>/comments/<int:pk>/",
        PortfolioCommentDeleteView.as_view(),
        name="portfolio-comment-delete",
    ),
]
