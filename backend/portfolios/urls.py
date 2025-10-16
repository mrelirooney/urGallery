from django.urls import path
from .views_public import ArtistLandingView

urlpatterns = [
    path("public/artists/<slug:slug>/landing/", ArtistLandingView.as_view(), name="artist-landing"),
]
