from django.urls import path
from .views import portfolio_detail, portfolio_page_detail
from .editor_views import ( portfolio_editor, editor_page_create, editor_page_detail, )

urlpatterns = [
    # public/viewer endpoints
    path("<slug:slug>/", portfolio_detail, name="portfolio-detail"),
    path("<slug:slug>/pages/<int:page_number>/", portfolio_page_detail, name="portfolio-page"),

    # editor endpoints (authenticated, owner-only)
    path("<slug:slug>/editor/", portfolio_editor, name="portfolio-editor"),
    path("<slug:slug>/editor/pages/", editor_page_create, name="editor-page-create"),
    path("<slug:slug>/editor/pages/<int:page_id>/", editor_page_detail, name="editor-page-detail"),
]
