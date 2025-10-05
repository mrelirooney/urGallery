from django.db import models
from django.conf import settings

class Privacy(models.TextChoices):
    DRAFT = "draft", "Draft"
    LINK_ONLY = "link_only", "Link-only"
    PUBLIC = "public", "Public"

class Portfolio(models.Model):
    # UUID PK
    id = models.BigAutoField(primary_key=True)

    # FK to User (kept as int FK since User PK is int for now)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="portfolios"
    )

    # required title
    title = models.CharField(max_length=140)

    # privacy enum
    privacy = models.CharField(
        max_length=20,
        choices=Privacy.choices,
        default=Privacy.DRAFT
    )

    # sidebar ordering
    order_index = models.IntegerField(default=0)

    # cached counter
    pages_count = models.PositiveIntegerField(default=1)

    # optional cover page (nullable FK to Page)
    # defined as a string because Page is declared below
    cover_page = models.ForeignKey(
        "Page",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="cover_for_portfolios"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order_index", "title"]
        indexes = [
            models.Index(fields=["user", "order_index"]),
        ]

    def __str__(self):
        return f"{self.title}"

class Page(models.Model):
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name="pages")
    title = models.CharField(max_length=140, blank=True)
    layout = models.CharField(max_length=50, blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.title or f"Page {self.id}"

class Media(models.Model):
    title = models.CharField(max_length=140, blank=True)
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to="media/covers/", blank=True, null=True)
    file = models.FileField(upload_to="media/files/", blank=True, null=True)
    external_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="media")

    def __str__(self):
        return self.title or f"Media {self.id}"

class PageMedia(models.Model):
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name="page_media")
    media = models.ForeignKey(Media, on_delete=models.CASCADE, related_name="page_media")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("page", "media")
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.page_id} ↔ {self.media_id}"
