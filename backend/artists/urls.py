from django.urls import path
from .views import ArtistLandingView, ArtistPortfolioDetailView
from .api import search_artists

urlpatterns = [
    path("search/", search_artists, name="search-artists"),  # Add this first
    path("<slug:slug>/", ArtistLandingView.as_view(), name="artist-landing"),
    path(
        "<slug:artist_slug>/portfolios/<slug:slug>/",
        ArtistPortfolioDetailView.as_view(),
        name="artist-portfolio-detail",
    ),
]