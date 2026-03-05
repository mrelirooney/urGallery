from django.urls import path, include
from accounts.views import (
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    RegisterView,
    MeView,
    LogoutView,
    csrf_cookie_view,
    ChangePasswordView,
    ChangeEmailView,
    ForgotPasswordView,
    ResetPasswordView,
)
from api.views import (
    MyProfileView,
    ThemeListView,
    MyPortfolioListCreateView,
    MyPortfolioDetailView,
    help_form_view,
)
from api.hashtag_views import my_hashtags_list, my_hashtags_add, my_hashtags_remove
from saves.views import MySavesView, SaveArtistView, SavePortfolioView

urlpatterns = [
    # ── CSRF ──────────────────────────────────────────────────────────
    path("auth/csrf/", csrf_cookie_view, name="csrf-cookie"),

    # ── AUTH ──────────────────────────────────────────────────────────
    path("auth/login/",    CookieTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/",  CookieTokenRefreshView.as_view(),    name="token_refresh"),
    path("auth/register/", RegisterView.as_view(),              name="register"),
    path("auth/me/",       MeView.as_view(),                    name="me"),
    path("auth/logout/",   LogoutView.as_view(),                name="logout"),

    # Account security (authenticated)
    path("auth/change-password/", ChangePasswordView.as_view(),  name="change-password"),
    path("auth/change-email/",    ChangeEmailView.as_view(),     name="change-email"),

    # Password reset (unauthenticated flow)
    path("auth/forgot-password/", ForgotPasswordView.as_view(),  name="forgot-password"),
    path("auth/reset-password/",  ResetPasswordView.as_view(),   name="reset-password"),

    # ── PUBLIC ARTISTS ────────────────────────────────────────────────
    path("artists/", include("artists.urls")),

    # ── MY (authenticated) ────────────────────────────────────────────
    path("my/profile/",                MyProfileView.as_view(),              name="my-profile"),
    path("my/hashtags/",               my_hashtags_list,                     name="my-hashtags-list"),
    path("my/hashtags/add/",           my_hashtags_add,                      name="my-hashtags-add"),
    path("my/hashtags/<int:pk>/",      my_hashtags_remove,                   name="my-hashtags-remove"),
    path("my/portfolios/",             MyPortfolioListCreateView.as_view(),  name="my-portfolio-list"),
    path("my/portfolios/<slug:slug>/", MyPortfolioDetailView.as_view(),      name="my-portfolio-detail"),

    # Saves
    path("my/saves/",                                              MySavesView.as_view(),       name="my-saves"),
    path("my/saves/artists/<slug:artist_slug>/",                   SaveArtistView.as_view(),    name="save-artist"),
    path("my/saves/portfolios/<slug:artist_slug>/<slug:portfolio_slug>/", SavePortfolioView.as_view(), name="save-portfolio"),

    # ── THEMES (public) ──────────────────────────────────────────────
    path("themes/", ThemeListView.as_view(), name="theme-list"),

    # ── HELP (authenticated) ─────────────────────────────────────────
    path("help/", help_form_view, name="help-form"),
]

