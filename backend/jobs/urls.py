from django.urls import path
from .views import (
    # Extension endpoints (original)
    JobView, JobDetailView, JobStatusUpdateView, ExtensionJobView,
    ExtensionSyncJobsView, GmailSyncView, DashboardView,
    # New endpoints
    InterviewListView, UpcomingInterviewsView, InterviewDetailView,
    EmailScanView,
)

urlpatterns = [
    # Extension endpoints (unchanged)
    path('', JobView.as_view()),
    path('<int:pk>/', JobDetailView.as_view()),
    path('<int:pk>/status/', JobStatusUpdateView.as_view()),
    path('dashboard/', DashboardView.as_view()),
    path('extension-add/', ExtensionJobView.as_view()),
    path('extension-sync/', ExtensionSyncJobsView.as_view()),
    path('sync-gmail/', GmailSyncView.as_view()),

    # Email parsing
    path('scan-emails/', EmailScanView.as_view()),
]