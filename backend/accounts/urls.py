# accounts/urls.py
from django.urls import path
from .views import (
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    MeView,
    RegisterView,
    LogoutView,
)
from .api import search_users  # local import is cleaner

urlpatterns = [
    path("login/",   CookieTokenObtainPairView.as_view(),   name="login"),
    path("refresh/", CookieTokenRefreshView.as_view(),      name="refresh"),
    path("me/",      MeView.as_view(),                      name="me"),
    path("register/", RegisterView.as_view(),               name="register"),
    path("logout/",  LogoutView.as_view(),                  name="logout"),
    path("artists/search/", search_users, name="search-artists"),
]
