from django.db import models
from django.conf import settings


class Job(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    company = models.CharField(max_length=255)
    role = models.CharField(max_length=255)

    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('viewed', 'Viewed'),
        ('interviewing', 'Interviewing'),
        ('interview', 'Interview'),       # legacy - kept for extension compat
        ('offered', 'Offered'),
        ('offer', 'Offer'),               # legacy - kept for extension compat
        ('rejected', 'Rejected'),
        ('accepted', 'Accepted'),
        ('withdrawn', 'Withdrawn'),
    ]

    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='applied')
    source = models.CharField(max_length=50, default='manual')  # extension / manual
    platform = models.CharField(max_length=50, default='unknown')  # linkedin / naukri / indeed
    job_url = models.URLField(max_length=500, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    salary = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    contact_person = models.CharField(max_length=255, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    follow_up = models.BooleanField(default=False)
    applied_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-applied_date']

    def __str__(self):
        return f"{self.company} - {self.role} ({self.status})"


class Interview(models.Model):
    """Tracks upcoming interviews with meeting links."""
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='interviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    scheduled_date = models.DateTimeField()
    meeting_link = models.URLField(max_length=500, blank=True, null=True)
    meeting_platform = models.CharField(max_length=50, blank=True, default='')  # zoom, meet, teams
    interviewer_name = models.CharField(max_length=255, blank=True, default='')
    interviewer_email = models.EmailField(blank=True, default='')
    notes = models.TextField(blank=True, default='')
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['scheduled_date']

    def __str__(self):
        return f"Interview for {self.job.company} - {self.job.role} on {self.scheduled_date}"


class EmailScanLog(models.Model):
    """Tracks email scanning activity for each user."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    scanned_at = models.DateTimeField(auto_now_add=True)
    emails_scanned = models.IntegerField(default=0)
    updates_made = models.IntegerField(default=0)
    details = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-scanned_at']

    def __str__(self):
        return f"Scan for {self.user.email} at {self.scanned_at} - {self.updates_made} updates"
