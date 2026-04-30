"""
URL configuration for backend project.
"""
from django.contrib import admin
from django.urls import path, include
from accounts.views import CustomTokenObtainPairView
from django.http import JsonResponse
from jobs.views import ApplicationListView, ApplicationDetailView, InterviewListView, UpcomingInterviewsView, InterviewDetailView

def welcome(request):
    return JsonResponse({
        "message": "Welcome to the Job Tracker API!",
        "status": "Online",
        "documentation": "Endpoints available at /api/accounts/ and /api/jobs/"
    })

urlpatterns = [
    path('', welcome, name='welcome'),
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/token/', CustomTokenObtainPairView.as_view()),
    
    # Safety net for double /api/api/ calls
    path('api/api/accounts/', include('accounts.urls')),
    path('api/api/token/', CustomTokenObtainPairView.as_view()),
    
    # Extension endpoints (original)
    path('api/jobs/', include('jobs.urls')),

    # Frontend endpoints (what React dashboard uses)
    path('applications', ApplicationListView.as_view()),
    path('applications/', ApplicationListView.as_view()),
    path('applications/<int:pk>', ApplicationDetailView.as_view()),
    path('applications/<int:pk>/', ApplicationDetailView.as_view()),

    # Interview endpoints
    path('api/interviews/', InterviewListView.as_view()),
    path('api/interviews/upcoming/', UpcomingInterviewsView.as_view()),
    path('api/interviews/<int:pk>/', InterviewDetailView.as_view()),
]
