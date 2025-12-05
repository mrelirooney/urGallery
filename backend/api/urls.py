from django.urls import path
from accounts.views import (
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    RegisterView,
    MeView,
    LogoutView,
    csrf_cookie_view,
)
from django.urls import path, include
from api.views import MyPortfolioListCreateView, MyPortfolioDetailView

urlpatterns = [
    # CSRF warm-up
    path("auth/csrf/", csrf_cookie_view, name="csrf-cookie"),

    # AUTH
    path("auth/login/", CookieTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("artists/", include("artists.urls")),
    
    # PORTFOLIOS (user's own portfolios)
    path("my/portfolios/", MyPortfolioListCreateView.as_view(), name="my-portfolio-list-create"),
    path("my/portfolios/<slug:slug>/", MyPortfolioDetailView.as_view(), name="my-portfolio-detail"),
]

