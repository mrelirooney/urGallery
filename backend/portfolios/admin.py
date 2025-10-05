from django.contrib import admin
from .models import Portfolio, Page, Media, PageMedia

class PageInline(admin.TabularInline):
    model = Page
    extra = 0

@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "user", "privacy", "order_index", "pages_count", "updated_at")
    list_filter = ("privacy",)
    search_fields = ("title", "user__email", "user__display_name")
    inlines = [PageInline]

@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ("id", "portfolio", "title", "order")

@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "owner", "created_at")
    search_fields = ("title", "owner__email")

@admin.register(PageMedia)
class PageMediaAdmin(admin.ModelAdmin):
    list_display = ("page", "media", "order")
