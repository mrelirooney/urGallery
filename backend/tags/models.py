from django.db import models
from django.conf import settings
from django.utils.text import slugify

class Hashtag(models.Model):
    # BigAutoField PK by default
    name = models.CharField(
        max_length=64,
        unique=True,
        help_text="lowercase, no #"
    )
    slug = models.SlugField(
        max_length=80,
        unique=True,
        help_text="url-safe"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["slug"]),
        ]

    def save(self, *args, **kwargs):
        # enforce lowercase and a stable slug
        self.name = (self.name or "").strip().lower().lstrip("#")
        if not self.slug:
            self.slug = slugify(self.name)[:80]
        super().save(*args, **kwargs)

    def __str__(self):
        return f"#{self.name}"

class UserHashtag(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="user_hashtags",
    )
    hashtag = models.ForeignKey(
        Hashtag,
        on_delete=models.CASCADE,
        related_name="user_hashtags",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "hashtag")
        indexes = [
            models.Index(fields=["user", "hashtag"]),
            models.Index(fields=["hashtag"]),
        ]

    def __str__(self):
        return f"{self.user_id} ↔ #{self.hashtag.name}"
