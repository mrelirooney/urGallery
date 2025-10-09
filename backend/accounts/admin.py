from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Profile, DefaultAvatar

class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    fk_name = "user"
    extra = 0
    fields = (
        "display_name", "title", "location", "bio",
        "default_avatar", "avatar_s3_key",
        "website_url","instagram_url","twitter_url","behance_url","dribbble_url","youtube_url","tiktok_url",
        "theme_id_hint",
    )

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    inlines = [ProfileInline]
    model = User
    list_display = ("email", "display_name", "first_name", "last_name", "is_staff", "is_superuser")
    list_filter = ("is_staff", "is_superuser", "is_active")
    search_fields = ("email", "display_name", "first_name", "last_name")
    ordering = ("email",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name", "display_name", "title", "location", "bio", "avatar", "hashtags")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "password1", "password2", "first_name", "last_name", "display_name"),
        }),
    )

@admin.register(DefaultAvatar)
class DefaultAvatarAdmin(admin.ModelAdmin):
    list_display = ("id", "label", "s3_key", "created_at")
    search_fields = ("label", "s3_key")
    ordering = ("label",)
