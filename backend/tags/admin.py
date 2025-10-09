from django.contrib import admin
from .models import Hashtag, UserHashtag

@admin.register(Hashtag)
class HashtagAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug", "created_at")
    search_fields = ("name", "slug")
    ordering = ("name",)

@admin.register(UserHashtag)
class UserHashtagAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "hashtag", "created_at")
    search_fields = ("user__email", "hashtag__name")
    list_filter = ("hashtag",)
