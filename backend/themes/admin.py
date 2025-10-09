from django.contrib import admin
from .models import Theme

@admin.register(Theme)
class ThemeAdmin(admin.ModelAdmin):
    list_display = ('name', 'key', 'version', 'is_active', 'created_at')
    search_fields = ('name', 'key')
    list_filter = ('is_active',)