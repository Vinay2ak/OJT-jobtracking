from django.urls import path
from .views import (
    SignupView, SendOTPView, VerifyOTPView, LoginWithOTPView, LoginStep1View,
    GoogleLoginView, GmailConnectView, GmailCallbackView, GmailStatusView, GmailDisconnectView,
)

urlpatterns = [
    # Auth (existing)
    path('signup/', SignupView.as_view()),
    path('send-otp/', SendOTPView.as_view()),
    path('verify-otp/', VerifyOTPView.as_view()),
    path('login-otp/', LoginWithOTPView.as_view()),
    path('login-step1/', LoginStep1View.as_view()),

    # Google Login
    path('google/', GoogleLoginView.as_view()),

    # Gmail OAuth2 (for email parsing)
    path('gmail/connect/', GmailConnectView.as_view()),
    path('gmail/callback/', GmailCallbackView.as_view()),
    path('gmail/status/', GmailStatusView.as_view()),
    path('gmail/disconnect/', GmailDisconnectView.as_view()),
]