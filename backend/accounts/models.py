from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError
from django.utils.text import slugify


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("The Email must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    # remove username entirely
    username = None

    # login identity
    email = models.EmailField(unique=True)

    # profile-ish fields
    first_name = models.CharField(max_length=120, blank=True)
    last_name  = models.CharField(max_length=120, blank=True)
    display_name = models.CharField(max_length=120, blank=True)
    title = models.CharField(max_length=120, blank=True)
    location = models.CharField(max_length=120, blank=True)
    bio = models.CharField(max_length=400, blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    hashtags = models.CharField(max_length=255, blank=True, help_text="CSV of 3–10 tags")

    USERNAME_FIELD = "email"          # ← login with email
    REQUIRED_FIELDS = []              # ← what 'createsuperuser' asks beyond email & password

    objects = UserManager()

    def __str__(self):
        return self.display_name or self.email
    
class DefaultAvatar(models.Model):
    # BigAutoField PK by default
    s3_key = models.CharField(max_length=255, unique=True, help_text="Path/key in S3")
    label  = models.CharField(max_length=120)  # required
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.label} ({self.s3_key})"

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    slug = models.SlugField(unique=True, blank=True, null=True)

    # public-facing info
    display_name = models.CharField(max_length=120, blank=True)
    title        = models.CharField(max_length=120, blank=True)
    location     = models.CharField(max_length=120, blank=True)
    bio          = models.CharField(max_length=400, blank=True)

    # flexible avatar choice
    default_avatar = models.ForeignKey(
        DefaultAvatar, on_delete=models.SET_NULL, null=True, blank=True, related_name="profiles"
    )
    avatar_s3_key = models.CharField(
        max_length=255, null=True, blank=True, help_text="If provided, overrides default avatar"
    )

    # socials (same as before)
    website_url   = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    twitter_url   = models.URLField(blank=True)
    behance_url   = models.URLField(blank=True)
    dribbble_url  = models.URLField(blank=True)
    youtube_url   = models.URLField(blank=True)
    tiktok_url    = models.URLField(blank=True)

    theme_id_hint = models.IntegerField(null=True, blank=True)
    theme = models.ForeignKey("themes.Theme", on_delete=models.SET_NULL, null=True, blank=True, related_name="profiles")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        # enforce mutual exclusivity
        if self.default_avatar and self.avatar_s3_key:
            raise ValidationError("Choose either a default avatar OR an uploaded avatar (S3 key), not both.")

    
    @receiver(post_save, sender=settings.AUTH_USER_MODEL)
    def create_or_update_user_profile(sender, instance, created, **kwargs):
        if created:
            Profile.objects.create(user=instance)
        else:
            # keep updated_at fresh even if only user changed
            if hasattr(instance, "profile"):
                instance.profile.save()
    
    def save(self, *args, **kwargs):
        # Auto-generate slug from display name if missing
        if not self.slug and self.display_name:
            base_slug = slugify(self.display_name)
            slug = base_slug
            counter = 1
            while Profile.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.display_name or f"Profile {self.id}"