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
from rest_framework_simplejwt.views import TokenObtainPairView

logger = logging.getLogger(__name__)

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        # First, let the standard login verify the password
        try:
            # We don't call super().post yet because we don't want to return tokens yet
            username = request.data.get('email') or request.data.get('username')
            password = request.data.get('password')
            
            from django.contrib.auth import authenticate
            user = authenticate(username=username, password=password)
            
            if user is not None:
                # Password is correct! Now trigger the OTP
                otp = str(random.randint(100000, 999999))
                OTP.objects.filter(email=user.email).delete()
                OTP.objects.create(email=user.email, otp=otp)
                
                print(f"!!! LOGIN OTP FOR {user.email} IS: {otp} !!!")
                
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
                    print(f"WARNING: Gmail failed but proceeding. Error: {str(e)}")
                    mail_status = "FAILED_BUT_LOGGED"

                return Response({
                    "message": "OTP_SENT",
                    "email": user.email,
                    "mail_status": mail_status,
                    "detail": "Password verified. If email doesn't arrive, check server logs."
                }, status=200)
            else:
                return Response({"error": "Invalid email or password"}, status=401)



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
        print(f"DEBUG: Received OTP request for email: {email}") # Added log

        if not email:
            return Response({"error": "Email required"}, status=400)

        otp = str(random.randint(100000, 999999))
        print(f"DEBUG: Generated OTP {otp} for {email}") # Added log

        # Delete any existing OTPs for this email to keep the table clean
        OTP.objects.filter(email=email).delete()

        OTP.objects.create(email=email, otp=otp)

        try:
            print(f"DEBUG: Attempting to send mail to {email}") # Added log
            send_mail(
                'Your OTP Code - Job Tracker',
                f'Your OTP is {otp}. It will expire in 10 minutes.',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            print(f"DEBUG: Mail sent successfully to {email}") # Added log
        except Exception as e:
            print(f"ERROR: Failed to send mail: {str(e)}") # Added log
            logger.error(f"Failed to send OTP email to {email}: {e}")
            # Even if mail fails, we return the OTP in debug mode
            return Response({
                "message": "OTP generated (but mail failed)",
                "otp_debug": otp, # Return OTP in response so you can see it in F12
                "error_detail": str(e)
            }, status=200)

        return Response({
            "message": "OTP sent",
            "otp_debug": otp  # Return OTP in response so you can see it in F12
        })
    


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




class LoginStep1View(APIView):
    """
    Step 1: Verify Email & Password. If correct, send OTP to Gmail.
    """
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({"error": "Email and password are required"}, status=400)

        try:
            user = User.objects.get(email=email)
            if not user.check_password(password):
                return Response({"error": "Invalid password"}, status=401)
        except User.DoesNotExist:
            return Response({"error": "No account found with this email"}, status=404)

        # Generate 6-digit OTP
        otp = str(random.randint(100000, 999999))
        OTP.objects.filter(email=email).delete() # Clear old OTPs
        OTP.objects.create(email=email, otp=otp)

        # Diagnostic logging
        print(f"[DIAGNOSTIC] Attempting to send mail via {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
        print(f"[DIAGNOSTIC] SSL: {settings.EMAIL_USE_SSL}, TLS: {settings.EMAIL_USE_TLS}")
        print(f"[DIAGNOSTIC] From Email: {settings.DEFAULT_FROM_EMAIL}")

        try:
            send_mail(
                'Your Login Verification Code',
                f'Your verification code is: {otp}\n\nThis code will expire in 10 minutes.',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            print(f"[DIAGNOSTIC] SUCCESS: Mail accepted by SMTP server for {email}")
            return Response({
                "message": "Verification code sent to your Gmail",
                "email": email
            }, status=200)
        except Exception as e:
            print(f"[DIAGNOSTIC] FAILED: SMTP Error: {str(e)}")
            logger.error(f"SMTP Error: {str(e)}")
            return Response({"error": f"Mail failed: {str(e)}"}, status=500)


class LoginWithOTPView(APIView):
    """
    Step 2: Verify the OTP sent to Gmail and return JWT tokens.
    """
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')

        if not email or not otp:
            return Response({"error": "Email and OTP are required"}, status=400)

        otp_obj = OTP.objects.filter(email=email).last()

        if not otp_obj or otp_obj.is_expired():
            return Response({"error": "OTP expired or not found. Please try again."}, status=400)

        if otp_obj.otp != otp:
            return Response({"error": "Invalid verification code"}, status=400)

        # OTP is correct!
        try:
            user = User.objects.get(email=email)
            otp_obj.delete() # Clean up used OTP

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "username": user.username,
                "email": user.email,
                "message": "Login successful"
            }, status=200)
        except User.DoesNotExist:
            return Response({"error": "User no longer exists"}, status=404)