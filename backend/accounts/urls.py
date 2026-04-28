from django.urls import path
from .views import SignupView, SendOTPView, VerifyOTPView, LoginWithOTPView, LoginStep1View

urlpatterns = [
    path('signup/', SignupView.as_view()),
    path('send-otp/', SendOTPView.as_view()),
    path('verify-otp/', VerifyOTPView.as_view()),
    path('login-otp/', LoginWithOTPView.as_view()),
    path('login-step1/', LoginStep1View.as_view()),
]