from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "type", "title", "read_at", "created_at")
    list_filter  = ("type", "read_at")
    search_fields = ("title", "body", "user__email")
    autocomplete_fields = ("user",)
    ordering = ("-created_at",)
