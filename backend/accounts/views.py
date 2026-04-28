import random
import logging
import datetime
from django.conf import settings
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from .models import OTP
from .serializers import SignupSerializer, UserSerializer

User = get_user_model()
logger = logging.getLogger(__name__)

def welcome(request):
    from django.http import JsonResponse
    return JsonResponse({"message": "Welcome to the Accounts API"})

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        email = request.data.get('email') or request.data.get('username')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({"error": "Email and password are required"}, status=400)

        user = authenticate(username=email, password=password)
        
        if user is not None:
            # Generate 6-digit OTP
            otp = str(random.randint(100000, 999999))
            OTP.objects.filter(email=user.email).delete()
            OTP.objects.create(email=user.email, otp=otp)
            
            # LOG THE OTP CLEARLY
            print(f"\n\n!!! [SECURITY] OTP FOR {user.email} IS: {otp} !!!\n\n", flush=True)
            
            mail_status = "NOT_ATTEMPTED"
            try:
                send_mail(
                    'Your Login Verification Code',
                    f'Your code is: {otp}',
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
                mail_status = "SENT"
            except Exception as e:
                print(f"SMTP ERROR: {str(e)}", flush=True)
                mail_status = f"FAILED: {str(e)}"
            
            return Response({
                "message": "OTP_SENT",
                "otp_for_debug": otp, # Backup if logs/email fail
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

class VerifyOTPView(APIView):
    # Keep this for signup verification if needed
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
            return Response({"error": "Email and OTP are required"}, status=400)

        otp_obj = OTP.objects.filter(email=email).last()
        if not otp_obj or otp_obj.is_expired() or otp_obj.otp != otp:
            return Response({"error": "Invalid or expired OTP"}, status=400)

        try:
            user = User.objects.get(email=email)
            otp_obj.delete()
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "username": user.username,
                "email": user.email,
                "message": "Login successful"
            }, status=200)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)