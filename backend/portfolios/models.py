import uuid
from django.conf import settings
from django.db import models
from django.utils.text import slugify
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password, check_password
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

User = get_user_model()

class Privacy(models.TextChoices):
    DRAFT = "draft", "Draft"
    PRIVATE = "private", "Private"
    PUBLIC = "public", "Public"


# ---------------------------------------------------------
#  Helper function for unique slugs (per user)
# ---------------------------------------------------------
def generate_unique_slug(user, title, instance_id=None):
    base = slugify(title) or "portfolio"
    slug = base

    qs = Portfolio.objects.filter(user=user)
    if instance_id:
        qs = qs.exclude(pk=instance_id)

    counter = 1
    while qs.filter(slug=slug).exists():
        counter += 1
        slug = f"{base}-{counter:02d}"

    return slug


# ---------------------------------------------------------
#  PORTFOLIO
# ---------------------------------------------------------
class Portfolio(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=100, unique=True, blank=True)

    privacy = models.CharField(
        max_length=20,
        choices=Privacy.choices,
        default=Privacy.DRAFT,
    )

    # Hashed password for private portfolios; blank when public
    password = models.CharField(max_length=128, blank=True, default="")

    order_index = models.IntegerField(default=0)
    pages_count = models.PositiveIntegerField(default=0)

    cover_page = models.ForeignKey(
        "Page",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="cover_for_portfolios",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order_index", "title"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "slug"],
                name="unique_user_portfolio_slug",
            ),
        ]

    def __str__(self):
        return f"{self.title} ({self.slug})"

    def _generate_gallery_slug(self):
        if self.slug:
            return
        base = "gallery"
        num = Portfolio.objects.count() + 1
        while Portfolio.objects.filter(slug=f"{base}-{num}").exists():
            num += 1
        self.slug = f"{base}-{num}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self._generate_gallery_slug()
        super().save(*args, **kwargs)

    def check_password(self, raw_password: str) -> bool:
        """Check if raw_password matches the stored hash. Empty password allowed for legacy private portfolios."""
        if not self.password:
            return raw_password == ""
        return check_password(raw_password, self.password)

    def set_password(self, raw_password: str) -> None:
        """Hash and store password. Use empty string to clear."""
        self.password = make_password(raw_password) if raw_password else ""


# ---------------------------------------------------------
#  PAGE
# ---------------------------------------------------------
class PortfolioPageLayout(models.TextChoices):
    LAYOUT_1 = "layout-1", "layout-1"
    LAYOUT_2 = "layout-2", "layout-2"
    LAYOUT_3 = "layout-3", "layout-3"
    LAYOUT_4 = "layout-4", "layout-4"
    LAYOUT_5 = "layout-5", "layout-5"
    LAYOUT_6 = "layout-6", "layout-6"
    LAYOUT_7 = "layout-7", "layout-7"
    LAYOUT_8 = "layout-8", "layout-8"
    LAYOUT_9 = "layout-9", "layout-9"
    LAYOUT_10 = "layout-10", "layout-10"
    LAYOUT_11 = "layout-11", "layout-11"
    LAYOUT_12 = "layout-12", "layout-12"
    LAYOUT_13 = "layout-13", "layout-13"
    LAYOUT_14 = "layout-14", "layout-14"
    LAYOUT_15 = "layout-15", "layout-15"


MEDIA_SHAPE_CHOICES = [
    ("1:1", "Square (1:1)"),
    ("9:16", "Vertical (9:16)"),
    ("16:9", "Wide (16:9)"),
    ("4:5", "Vertical (4:5)"),
    ("5:4", "Wide (5:4)"),
]


class Page(models.Model):
    portfolio = models.ForeignKey(
        Portfolio,
        related_name="pages",
        on_delete=models.CASCADE,
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    layout = models.CharField(
        max_length=50,
        choices=PortfolioPageLayout.choices,
        default=PortfolioPageLayout.LAYOUT_1,
    )

    # First column/media
    media_image = models.ImageField(
        upload_to="portfolio_pages/",
        blank=True,
        null=True,
    )

    media_shape = models.CharField(
        max_length=4,
        choices=MEDIA_SHAPE_CHOICES,
        default="1:1",
    )

    # Second column/media (for two-column layouts)
    media_image_2 = models.ImageField(
        upload_to="portfolio_pages/",
        blank=True,
        null=True,
    )

    media_shape_2 = models.CharField(
        max_length=4,
        choices=MEDIA_SHAPE_CHOICES,
        default="1:1",
        blank=True,
    )

    title_2 = models.CharField(max_length=255, blank=True)
    description_2 = models.TextField(blank=True)

    # Body/paragraph text for layout-4 (sub header = description, body = description_body)
    description_body = models.TextField(blank=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.title} (Page {self.order})"


# ---------------------------------------------------------
#  MEDIA + PAGE-MEDIA
# ---------------------------------------------------------
class Media(models.Model):
    title = models.CharField(max_length=140, blank=True)
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to="media/covers/", blank=True, null=True)
    file = models.FileField(upload_to="media/files/", blank=True, null=True)
    external_url = models.URLField(blank=True)

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="media",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.title or f"Media {self.id}"


class PageMedia(models.Model):
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name="page_media")
    media = models.ForeignKey(Media, on_delete=models.CASCADE, related_name="page_media")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]
        constraints = [
            models.UniqueConstraint(fields=["page", "media"], name="uniq_page_media_pair"),
            models.UniqueConstraint(fields=["page", "order"], name="uniq_page_media_order"),
        ]

    def __str__(self):
        return f"{self.page_id} ↔ {self.media_id}"


# ---------------------------------------------------------
#  COMMENTS
# ---------------------------------------------------------
class Comment(models.Model):
    portfolio = models.ForeignKey(
        Portfolio,
        on_delete=models.CASCADE,
        related_name="comments",
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="portfolio_comments",
    )
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Comment by {self.author_id} on {self.portfolio_id}"


# ---------------------------------------------------------
#  Auto-update pages_count
# ---------------------------------------------------------
def _recount_pages(portfolio_id: int):
    from django.db.models import Count
    Portfolio.objects.filter(pk=portfolio_id).update(
        pages_count=Page.objects.filter(portfolio_id=portfolio_id).count()
    )


@receiver(post_save, sender=Page)
def _page_saved(sender, instance, **kwargs):
    _recount_pages(instance.portfolio_id)


@receiver(post_delete, sender=Page)
def _page_deleted(sender, instance, **kwargs):
    _recount_pages(instance.portfolio_id)


# ---------------------------------------------------------
#  DRAFT PORTFOLIOS (for editor)
# ---------------------------------------------------------
class DraftPortfolio(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="draft_portfolios")
    slug = models.SlugField(max_length=255, unique=True)

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    privacy = models.CharField(
        max_length=20,
        choices=Privacy.choices,
        default=Privacy.DRAFT,
    )

    # Plain-text or hashed password for private; editor sends plain, we hash on save
    password = models.CharField(max_length=128, blank=True, default="")

    has_unpublished_changes = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Only generate slug if it doesn't exist yet (on creation)
        # Once created, the slug should remain stable to match the live portfolio
        if not self.slug and self.title:
            base = slugify(self.title) or "portfolio"
            slug = base
            counter = 1
            while DraftPortfolio.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{counter:02d}"
                counter += 1
            self.slug = slug

        super().save(*args, **kwargs)


class DraftPage(models.Model):
    draft_portfolio = models.ForeignKey(
        DraftPortfolio,
        on_delete=models.CASCADE,
        related_name="pages"
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    layout = models.CharField(
        max_length=50,
        choices=PortfolioPageLayout.choices,
        default=PortfolioPageLayout.LAYOUT_1,
    )

    # First column/media
    media_image = models.ImageField(
        upload_to="draft_portfolio_pages/",
        blank=True,
        null=True
    )

    media_shape = models.CharField(
        max_length=4,
        choices=MEDIA_SHAPE_CHOICES,
        default="1:1",
    )

    # Second column/media (for two-column layouts)
    media_image_2 = models.ImageField(
        upload_to="draft_portfolio_pages/",
        blank=True,
        null=True
    )

    media_shape_2 = models.CharField(
        max_length=4,
        choices=MEDIA_SHAPE_CHOICES,
        default="1:1",
        blank=True,
    )

    title_2 = models.CharField(max_length=255, blank=True)
    description_2 = models.TextField(blank=True)

    description_body = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Draft Page {self.order} for {self.draft_portfolio.slug}"
