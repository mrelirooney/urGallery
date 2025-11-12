# backend/portfolios/urls.py
from django.urls import path
from .views import portfolio_detail, portfolio_page_detail

urlpatterns = [
    path("<slug:slug>/", portfolio_detail, name="portfolio-detail"),
    path("<slug:slug>/pages/<int:page_number>/", portfolio_page_detail, name="portfolio-page"),
]
