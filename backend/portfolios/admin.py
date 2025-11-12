
from django.contrib import admin
from .models import Portfolio, Page

class PageInline(admin.TabularInline):
    model = Page
    extra = 0
    fields = ("order", "title", "description", "layout")
    ordering = ("order",)

@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "pages_count", "privacy", "order_index", "updated_at")
    list_filter = ("privacy",)
    search_fields = ("title", "slug", "user__username")
    readonly_fields = ("pages_count", "created_at", "updated_at")
    inlines = [PageInline]

@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ("title", "portfolio", "order", "created_at")
    list_filter = ("portfolio",)
    ordering = ("portfolio", "order")
