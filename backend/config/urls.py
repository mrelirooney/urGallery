"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from artists.api import search_artists, artist_detail


urlpatterns = [
    path("admin/", admin.site.urls),
    # 👇 NEW: hook up auth endpoints
    path("api/auth/", include("accounts.urls")),
    # existing artist endpoints
    path("api/artists/search/", search_artists, name="search-artists"),
    path("api/artists/<slug:slug>/", artist_detail, name="artist-detail"),
    # whatever Gemini set up here
    path("api/", include("api.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)