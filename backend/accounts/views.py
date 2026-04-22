from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import SignupSerializer
from django.core.mail import send_mail
from django.conf import settings
from .models import OTP
import random


from django.contrib.auth import get_user_model
User = get_user_model()


from rest_framework_simplejwt.tokens import RefreshToken


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

        OTP.objects.create(email=email, otp=otp)

        send_mail(
            'Your OTP Code',
            f'Your OTP is {otp}',
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )

        return Response({"message": "OTP sent"})
    


class VerifyOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        username = request.data.get('username')
        password = request.data.get('password')

        if not email or not otp:
            return Response({"error": "Email and OTP required"}, status=400)

        otp_obj = OTP.objects.filter(email=email).last()

        if not otp_obj:
            return Response({"error": "OTP not found"}, status=404)

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

        return Response({"message": "User created successfully"})




class LoginWithOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')

        if not email or not otp:
            return Response({"error": "Email and OTP required"}, status=400)

        otp_obj = OTP.objects.filter(email=email).last()

        if not otp_obj:
            return Response({"error": "OTP not found"}, status=404)

        if otp_obj.otp != otp:
            return Response({"error": "Invalid OTP"}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        # generate JWT token
        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        })