import random
import logging
import json
import urllib.request
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from .models import OTP
from .serializers import SignupSerializer

User = get_user_model()
logger = logging.getLogger(__name__)


def send_email_via_brevo(to_email, subject, body):
    """Send email using Brevo HTTP API (bypasses Render's SMTP block)."""
    url = "https://api.brevo.com/v3/smtp/email"
    data = {
        "sender": {"email": settings.DEFAULT_FROM_EMAIL, "name": "Job Tracker"},
        "to": [{"email": to_email}],
        "subject": subject,
        "textContent": body
    }
    headers = {
        "api-key": settings.BREVO_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers=headers,
        method="POST"
    )
    response = urllib.request.urlopen(req, timeout=15)
    print(f"Brevo API response: {response.status}", flush=True)
    return response.status


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        email = request.data.get('email') or request.data.get('username')
        password = request.data.get('password')

        if not email or not password:
            return Response({"error": "Email and password are required"}, status=400)

        user = authenticate(username=email, password=password)

        if user is not None:
            otp = str(random.randint(100000, 999999))
            OTP.objects.filter(email=user.email).delete()
            OTP.objects.create(email=user.email, otp=otp)

            print(f"\n!!! OTP FOR {user.email} IS: {otp} !!!\n", flush=True)

            try:
                send_email_via_brevo(
                    to_email=user.email,
                    subject="Your Login Verification Code",
                    body=f"Your verification code is: {otp}\n\nThis code expires in 10 minutes."
                )
                mail_status = "SENT"
                print(f"Email SENT to {user.email} via Brevo", flush=True)
            except Exception as e:
                print(f"Brevo email error: {str(e)}", flush=True)
                mail_status = f"FAILED: {str(e)}"

            return Response({
                "message": "OTP_SENT",
                "otp_for_debug": otp,
                "email": user.email,
                "mail_status": mail_status
            }, status=200)
        else:
            return Response({"error": "Invalid email or password"}, status=401)


class SignupView(APIView):
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created. Please log in."}, status=201)
        return Response(serializer.errors, status=400)


class SendOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email required"}, status=400)
        otp = str(random.randint(100000, 999999))
        OTP.objects.filter(email=email).delete()
        OTP.objects.create(email=email, otp=otp)
        print(f"!!! SIGNUP OTP FOR {email} IS: {otp} !!!", flush=True)
        try:
            send_email_via_brevo(
                to_email=email,
                subject="Verify your Email",
                body=f"Your verification code is: {otp}"
            )
            return Response({"message": "OTP sent"})
        except Exception as e:
            print(f"Brevo error: {str(e)}", flush=True)
            return Response({"message": "OTP generated", "otp_debug": otp})


class VerifyOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        otp_obj = OTP.objects.filter(email=email).last()
        if otp_obj and not otp_obj.is_expired() and otp_obj.otp == otp:
            otp_obj.delete()
            return Response({"message": "Email verified"}, status=200)
        return Response({"error": "Invalid or expired OTP"}, status=400)


class LoginWithOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        if not email or not otp:
            return Response({"error": "Required fields missing"}, status=400)
        otp_obj = OTP.objects.filter(email=email).last()
        if not otp_obj or otp_obj.is_expired() or otp_obj.otp != otp:
            return Response({"error": "Invalid or expired OTP"}, status=400)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
        otp_obj.delete()
        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "username": user.username,
            "email": user.email
        }, status=200)


class LoginStep1View(APIView):
    def post(self, request):
        return CustomTokenObtainPairView().post(request)