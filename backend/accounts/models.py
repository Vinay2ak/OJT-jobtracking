from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta


class User(AbstractUser):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    notification_enabled = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']


class OTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    OTP_EXPIRY_MINUTES = 10

    def is_expired(self):
        """Check if this OTP has expired (older than 10 minutes)."""
        return timezone.now() > self.created_at + timedelta(minutes=self.OTP_EXPIRY_MINUTES)

    def __str__(self):
        return f"OTP for {self.email} at {self.created_at}"


class GmailConnection(models.Model):
    """Stores Gmail OAuth2 tokens for each user's email parsing."""
    user = models.OneToOneField('User', on_delete=models.CASCADE, related_name='gmail_connection')
    access_token = models.TextField()
    refresh_token = models.TextField()
    token_expiry = models.DateTimeField()
    gmail_email = models.EmailField(blank=True, default='')
    connected_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Gmail connection for {self.user.email}"