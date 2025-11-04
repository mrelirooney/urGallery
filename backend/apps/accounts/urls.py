from django.urls import path
from .api import search_users

urlpatterns = [
    path("artists/search/", search_users, name="search-artists"),
]
