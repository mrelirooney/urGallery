from django.urls import path
from .views import (
    MeView, ThemeListView, HashtagListView,
    MyProfileView,
    MyPortfolioListCreateView, MyPortfolioDetailView, PortfolioPublicListView,
    PageListCreateView, PageDetailView,
)

urlpatterns = [
    path("me/", MeView.as_view(), name="me"),
    path("me/profile/", MyProfileView.as_view(), name="my-profile"),

    path("themes/", ThemeListView.as_view(), name="themes-list"),
    path("hashtags/", HashtagListView.as_view(), name="hashtags-list"),

    path("portfolios/", MyPortfolioListCreateView.as_view(), name="my-portfolios"),
    path("portfolios/<int:pk>/", MyPortfolioDetailView.as_view(), name="my-portfolio-detail"),
    path("portfolios/public/", PortfolioPublicListView.as_view(), name="public-portfolios"),

    path("portfolios/<int:portfolio_id>/pages/", PageListCreateView.as_view(), name="pages-for-portfolio"),
    path("pages/<int:pk>/", PageDetailView.as_view(), name="page-detail"),
]
