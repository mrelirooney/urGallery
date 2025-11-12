# backend/api/urls.py
from django.urls import path, include
from artists.api import artist_detail, search_artists

urlpatterns = [
    # artist + search endpoints (direct)
    path("artists/<slug:slug>/", artist_detail, name="artist-detail"),
    path("search/", search_artists, name="artist-search"),

    # portfolios endpoints (this one IS a package with its own urls.py)
    path("portfolios/", include("portfolios.urls")),
]
