# backend/portfolios/urls.py

from django.urls import path
from . import views_public      # public / API views
from . import editor_views      # draft/editor views

urlpatterns = [

    # -------------------------
    # EDITOR ROUTES (DRAFT SIDE)
    # These match what the frontend is calling:
    # /api/portfolios/<portfolio_slug>/editor/...
    # -------------------------

    # Draft portfolio detail (load/save draft metadata + pages)
    path(
        "<slug:slug>/editor/",
        editor_views.editor_portfolio_detail,
        name="editor-portfolio-detail",
    ),

    # Create a new draft page (Add Page)
    path(
        "<slug:slug>/editor/pages/",
        editor_views.editor_create_page,
        name="editor-create-page",
    ),

    # Update / delete a single draft page (Delete, image upload, etc.)
    path(
        "<slug:slug>/editor/pages/<int:page_id>/",
        editor_views.editor_update_page,
        name="editor-update-page",
    ),

    # Reorder draft pages (drag & drop)
    path(
        "<slug:slug>/editor/reorder/",
        editor_views.editor_reorder_pages,
        name="editor-reorder-pages",
    ),

    # Publish draft → live
    path(
        "<slug:slug>/editor/publish/",
        editor_views.publish_portfolio,
        name="editor-publish-portfolio",
    ),

    # -------------------------
    # PUBLIC / API ROUTES
    # -------------------------

    # Artist landing: profile + list of non-draft portfolios
    # GET /api/portfolios/<artist_slug>/
    path(
        "<slug:slug>/",
        views_public.ArtistLandingView.as_view(),
        name="artist-landing",
    ),

    # Public portfolio detail (one portfolio + its pages)
    # GET /api/portfolios/<artist_slug>/<portfolio_slug>/
    path(
        "<slug:artist_slug>/<slug:slug>/",
        views_public.PublicPortfolioDetailView.as_view(),
        name="portfolio-detail",
    ),

]
