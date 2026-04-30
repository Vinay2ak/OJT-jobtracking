from django.contrib import admin
from .models import Job, Interview, EmailScanLog


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('company', 'role', 'status', 'user', 'applied_date', 'source')
    list_filter = ('status', 'source', 'platform')
    search_fields = ('company', 'role', 'user__email')


@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display = ('job', 'user', 'scheduled_date', 'meeting_platform', 'is_completed')
    list_filter = ('meeting_platform', 'is_completed')


@admin.register(EmailScanLog)
class EmailScanLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'scanned_at', 'emails_scanned', 'updates_made')
    list_filter = ('scanned_at',)
