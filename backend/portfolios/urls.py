# backend/portfolios/urls.py
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

    # Editor: portfolio-level update/delete
    path(
        "<slug:slug>/editor/",
        editor_views.portfolio_editor_detail,
        name="portfolio-editor-detail",
    ),

    # Editor: create a new page (POST)
    path(
        "<slug:slug>/editor/pages/",
        editor_views.portfolio_editor_page_create,
        name="portfolio-editor-page-create",
    ),

    # Editor: page-level get/update/delete
    path(
        "<slug:slug>/editor/pages/<int:page_number>/",
        editor_views.portfolio_editor_page_detail,
        name="portfolio-editor-page-detail",
    ),

    # Editor: reorder pages (PATCH)
    path(
        "<slug:slug>/editor/reorder/",
        editor_views.portfolio_editor_reorder_pages,
        name="portfolio-editor-reorder-pages",
    ),
]