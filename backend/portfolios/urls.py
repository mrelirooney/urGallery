# portfolios/urls.py
# All routes here are editor (draft) routes.
# Public artist/portfolio routes live under /api/artists/ (see artists/urls.py).

from django.urls import path
from . import editor_views

urlpatterns = [
    # GET/PATCH  /api/portfolios/<portfolio_slug>/editor/
    path(
        "<slug:slug>/editor/",
        editor_views.editor_portfolio_detail,
        name="editor-portfolio-detail",
    ),
    # POST  /api/portfolios/<portfolio_slug>/editor/pages/
    path(
        "<slug:slug>/editor/pages/",
        editor_views.editor_create_page,
        name="editor-create-page",
    ),
    # GET/PATCH/DELETE  /api/portfolios/<portfolio_slug>/editor/pages/<page_id>/
    path(
        "<slug:slug>/editor/pages/<int:page_id>/",
        editor_views.editor_update_page,
        name="editor-update-page",
    ),
    # PATCH  /api/portfolios/<portfolio_slug>/editor/reorder/
    path(
        "<slug:slug>/editor/reorder/",
        editor_views.editor_reorder_pages,
        name="editor-reorder-pages",
    ),
    # POST  /api/portfolios/<portfolio_slug>/editor/publish/
    path(
        "<slug:slug>/editor/publish/",
        editor_views.publish_portfolio,
        name="editor-publish-portfolio",
    ),
]
