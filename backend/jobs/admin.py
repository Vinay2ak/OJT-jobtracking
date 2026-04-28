from django.contrib import admin
from .models import Job


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['company', 'role', 'status', 'platform', 'source', 'user', 'applied_date']
    list_filter = ['status', 'platform', 'source']
    search_fields = ['company', 'role']
    ordering = ['-applied_date']
