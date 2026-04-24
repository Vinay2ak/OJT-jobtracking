"""
URL configuration for backend project.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView
from django.http import JsonResponse

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
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/jobs/', include('jobs.urls')),
]
