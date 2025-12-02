from django.urls import path
from .views import ArtistLandingView, ArtistPortfolioDetailView

urlpatterns = [
    path("<slug:slug>/", ArtistLandingView.as_view(), name="artist-landing"),
    path(
        "<slug:artist_slug>/portfolios/<slug:slug>/",
        ArtistPortfolioDetailView.as_view(),
        name="artist-portfolio-detail",
    ),
]
