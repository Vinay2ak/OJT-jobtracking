from django.urls import path
from .views import (
    # Extension/Jobs endpoints
    JobView, JobDetailView, JobStatusUpdateView, ExtensionJobView,
    ExtensionSyncJobsView, GmailSyncView, DashboardView,
    # Application endpoints
    ApplicationListView, ApplicationDetailView,
    # Interview endpoints
    InterviewListView, UpcomingInterviewsView, InterviewDetailView,
    # Email parsing
    EmailScanView,
)

urlpatterns = [
    # Jobs (maintains compatibility with extension at api/jobs/)
    path('jobs/', JobView.as_view()),
    path('jobs/<int:pk>/', JobDetailView.as_view()),
    path('jobs/<int:pk>/status/', JobStatusUpdateView.as_view()),
    path('jobs/dashboard/', DashboardView.as_view()),
    path('jobs/extension-add/', ExtensionJobView.as_view()),
    path('jobs/extension-sync/', ExtensionSyncJobsView.as_view()),
    path('jobs/sync-gmail/', GmailSyncView.as_view()),

    # Applications (frontend dashboard at api/applications/)
    path('applications/', ApplicationListView.as_view()),
    path('applications', ApplicationListView.as_view()),
    path('applications/<int:pk>/', ApplicationDetailView.as_view()),
    path('applications/<int:pk>', ApplicationDetailView.as_view()),

    # Interviews (frontend dashboard at api/interviews/)
    path('interviews/', InterviewListView.as_view()),
    path('interviews/upcoming/', UpcomingInterviewsView.as_view()),
    path('interviews/<int:pk>/', InterviewDetailView.as_view()),

    # Email parsing
    path('scan-emails/', EmailScanView.as_view()),
]