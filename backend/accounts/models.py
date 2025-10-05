from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

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
