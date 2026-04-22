from django.db import models
from django.conf import settings


class Job(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    company = models.CharField(max_length=255)
    role = models.CharField(max_length=255)

    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('viewed', 'Viewed'),
        ('interview', 'Interview'),
        ('offer', 'Offer'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    ]

    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='applied')
    source = models.CharField(max_length=50, default='manual')  # extension / manual
    platform = models.CharField(max_length=50, default='unknown')  # linkedin / naukri / indeed
    job_url = models.URLField(max_length=500, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    salary = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    applied_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-applied_date']

    def __str__(self):
        return f"{self.company} - {self.role} ({self.status})"
