from django.db import models
from django.conf import settings

class NotificationType(models.TextChoices):
    INFO    = "info", "Info"
    SUCCESS = "success", "Success"
    WARNING = "warning", "Warning"
    ERROR   = "error", "Error"
    SYSTEM  = "system", "System"

class Notification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    type = models.CharField(max_length=16, choices=NotificationType.choices, default=NotificationType.INFO)
    title = models.CharField(max_length=200)
    body = models.TextField(blank=True, null=True)
    action_url = models.URLField(blank=True, null=True)
    read_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "created_at"]),
            models.Index(fields=["user", "read_at"]),
        ]

    def __str__(self):
        return f"[{self.type}] {self.title} → {self.user_id}"
