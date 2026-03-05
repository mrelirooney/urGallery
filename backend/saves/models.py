from django.conf import settings
from django.db import models
from portfolios.models import Portfolio
from accounts.models import Profile


class SavedArtist(models.Model):
    """A user saves another artist's profile."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="saved_artists",
    )
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="saved_by",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["user", "profile"], name="unique_saved_artist"),
        ]

    def __str__(self):
        return f"{self.user_id} saved artist {self.profile_id}"


class SavedPortfolio(models.Model):
    """A user saves a portfolio."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="saved_portfolios",
    )
    portfolio = models.ForeignKey(
        Portfolio,
        on_delete=models.CASCADE,
        related_name="saved_by",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["user", "portfolio"], name="unique_saved_portfolio"),
        ]

    def __str__(self):
        return f"{self.user_id} saved portfolio {self.portfolio_id}"
