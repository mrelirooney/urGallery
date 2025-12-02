# backend/portfolios/urls.py

from django.urls import path
from . import views          # editor views
from . import views_public   # public views

urlpatterns = [
    # ------------------------------
    # PUBLIC PORTFOLIO (LIVE SITE)
    # ------------------------------
    path("<slug:slug>/", views_public.portfolio_detail, name="portfolio-detail"),

    # ------------------------------
    # EDITOR ROUTES (DRAFT SIDE)
    # ------------------------------
    path("drafts/<slug:slug>/", views.editor_portfolio_detail, name="editor-portfolio-detail"),
    path("drafts/<slug:slug>/pages/<int:page_id>/", views.editor_page_detail, name="editor-page-detail"),
    path("drafts/<slug:slug>/reorder/", views.editor_reorder_pages, name="editor-reorder-pages"),
    path("drafts/<slug:slug>/publish/", views.editor_publish_draft, name="editor-publish-draft"),
]
