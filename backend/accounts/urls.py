from django.urls import path
from .views import CookieTokenObtainPairView

urlpatterns = [
    path("login/", CookieTokenObtainPairView.as_view(), name="token_obtain_pair"),
]
