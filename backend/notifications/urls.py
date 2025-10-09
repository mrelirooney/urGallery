from django.urls import path
from .views import MyNotificationListView, MarkNotificationReadView

urlpatterns = [
    path("", MyNotificationListView.as_view(), name="my-notifications"),
    path("<int:pk>/read/", MarkNotificationReadView.as_view(), name="notification-read"),
]
