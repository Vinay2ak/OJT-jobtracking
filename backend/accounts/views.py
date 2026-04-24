from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import SignupSerializer
from django.core.mail import send_mail
from django.conf import settings
from .models import OTP
import random
import logging

from django.contrib.auth import get_user_model
User = get_user_model()

from rest_framework_simplejwt.tokens import RefreshToken

logger = logging.getLogger(__name__)


class SignupView(APIView):
    def post(self, request):
        serializer = SignupSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created"}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class SendOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response({"error": "Email required"}, status=400)

        otp = str(random.randint(100000, 999999))

        # Delete any existing OTPs for this email to keep the table clean
        OTP.objects.filter(email=email).delete()

        OTP.objects.create(email=email, otp=otp)

        try:
            send_mail(
                'Your OTP Code - Job Tracker',
                f'Your OTP is {otp}. It will expire in 10 minutes.',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
        except Exception as e:
            logger.error(f"Failed to send OTP email to {email}: {e}")
            return Response({"error": "Failed to send OTP email. Please try again."}, status=500)

        return Response({"message": "OTP sent"})
    


class VerifyOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        username = request.data.get('username')
        password = request.data.get('password')

        if not email or not otp:
            return Response({"error": "Email and OTP required"}, status=400)

        if not username:
            return Response({"error": "Username is required"}, status=400)

        otp_obj = OTP.objects.filter(email=email).last()

        if not otp_obj:
            return Response({"error": "OTP not found. Please request a new one."}, status=404)

        # Check expiration
        if otp_obj.is_expired():
            otp_obj.delete()
            return Response({"error": "OTP has expired. Please request a new one."}, status=400)

        if otp_obj.otp != otp:
            return Response({"error": "Invalid OTP"}, status=400)

        # check if user already exists
        if User.objects.filter(email=email).exists():
            return Response({"error": "User already exists"}, status=400)
        # check if username exists
        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already taken"}, status=400)

        user = User.objects.create_user(
            email=email,
            username=username,
            password=password
        )

        # Clean up the used OTP
        OTP.objects.filter(email=email).delete()

        # Generate JWT tokens so user is logged in immediately after signup
        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "User created successfully",
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        }, status=status.HTTP_201_CREATED)




class LoginWithOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')

        if not email or not otp:
            return Response({"error": "Email and OTP required"}, status=400)

        otp_obj = OTP.objects.filter(email=email).last()

        if not otp_obj:
            return Response({"error": "OTP not found. Please request a new one."}, status=404)

        # Check expiration
        if otp_obj.is_expired():
            otp_obj.delete()
            return Response({"error": "OTP has expired. Please request a new one."}, status=400)

        if otp_obj.otp != otp:
            return Response({"error": "Invalid OTP"}, status=400)

        # Clean up the used OTP
        OTP.objects.filter(email=email).delete()

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Auto-create the user if they don't exist (e.g., first-time login via OTP)
            username = email.split('@')[0]
            # Ensure unique username
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            user = User.objects.create_user(
                email=email,
                username=username,
                password=None  # OTP-only users don't need a password
            )

        # generate JWT token
        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "username": user.username,
            "email": user.email
        })