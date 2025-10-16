from django.db import models
from django.conf import settings
from django.utils.text import slugify

class Privacy(models.TextChoices):
    DRAFT = "draft", "Draft"
    LINK_ONLY = "link_only", "Link-only"
    PUBLIC = "public", "Public"

class Portfolio(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="portfolios")
    title = models.CharField(max_length=140)
    slug = models.SlugField(unique=True, max_length=140, blank=True)

    privacy = models.CharField(
        max_length=20,
        choices=Privacy.choices,
        default=Privacy.DRAFT
    )

    order_index = models.IntegerField(default=0)
    pages_count = models.PositiveIntegerField(default=1)
    cover_page = models.ForeignKey(
        "Page", on_delete=models.SET_NULL, null=True, blank=True, related_name="cover_for_portfolios"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order_index", "title"]

    def save(self, *args, **kwargs):
        if (not self.slug) and self.title:
            base = slugify(self.title) or "portfolio"
            slug = base
            n = 1
            while Portfolio.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                n += 1
                slug = f"{base}-{n}"
            self.slug = slug
        super().save(*args, **kwargs)
    

class Page(models.Model):
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name="pages")
    title = models.CharField(max_length=140, blank=True)
    description = models.CharField(max_length=140, blank=True)
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
    page  = models.ForeignKey(Page,  on_delete=models.CASCADE, related_name="page_media")
    media = models.ForeignKey(Media, on_delete=models.CASCADE, related_name="page_media")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]
        constraints = [
            models.UniqueConstraint(fields=["page", "media"], name="uniq_page_media"),
            models.UniqueConstraint(fields=["page", "order"], name="uniq_page_order"),
        ]

    def __str__(self):
        return f"{self.page_id} ↔ {self.media_id}"
