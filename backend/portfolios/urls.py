from django.urls import path

from . import views, editor_views

urlpatterns = [
    # Public viewer endpoints
    path("<slug:slug>/", views.portfolio_detail, name="portfolio-detail"),
    path(
        "<slug:slug>/pages/<int:page_number>/",
        views.portfolio_page_detail,
        name="portfolio-page",
    ),

    # --- Editor: portfolio data for React editor (GET) ---
    # This is what your frontend calls at /api/portfolios/<slug>/editor/
    # --- Editor: create a new page (POST) ---
    path(
        "<slug:slug>/editor/pages/",
        editor_views.editor_create_page,
        name="portfolio-editor-page-create",
    ),

    # Editor: portfolio-level get + update
    path(
        "<slug:slug>/editor/",
        editor_views.editor_portfolio_detail,
        name="portfolio-editor-detail",
    ),

    # --- Editor: page-level get/update/delete (PUT/PATCH/DELETE) ---
    # NOTE: url param is page_id to match editor_update_page/editor_delete_page
    path(
        "<slug:slug>/editor/pages/<int:page_id>/",
        editor_views.editor_update_page,
        name="portfolio-editor-page-detail",
    ),

    # If you want a separate delete route later, you could add:
    # path(
    #     "<slug:slug>/editor/pages/<int:page_id>/delete/",
    #     editor_views.editor_delete_page,
    #     name="portfolio-editor-page-delete",
    # ),

    # --- Editor: reorder pages (POST) ---
    path(
        "<slug:slug>/editor/reorder/",
        editor_views.editor_reorder_pages,
        name="portfolio-editor-reorder-pages",
    ),

    path(
        "portfolios/<slug:slug>/editor/publish/",
        editor_views.publish_portfolio,
        name="portfolio-publish",
    ),

    path(
        "<slug:slug>/editor/publish/",
        editor_views.publish_portfolio,
        name="portfolio-publish",
    )
]
