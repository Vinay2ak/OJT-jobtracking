import random
import logging
import json
import urllib.request
import urllib.parse
from django.conf import settings
from django.shortcuts import redirect
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from .models import OTP, GmailConnection
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


# ============================================================
# AUTH ENDPOINTS — Login with OTP
# ============================================================

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


# ============================================================
# GOOGLE LOGIN — "Continue with Google" button
# ============================================================

class GoogleLoginView(APIView):
    """Receives a Google ID token from the frontend and logs in/creates the user."""
    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({"error": "Google token required"}, status=400)

        # Verify the Google ID token
        try:
            verify_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
            req = urllib.request.Request(verify_url)
            response = urllib.request.urlopen(req, timeout=10)
            google_data = json.loads(response.read().decode('utf-8'))

            email = google_data.get('email')
            name = google_data.get('name', '')

            if not email:
                return Response({"error": "Could not get email from Google"}, status=400)

            # Check if Google Client ID matches
            if google_data.get('aud') != settings.GOOGLE_CLIENT_ID:
                return Response({"error": "Invalid Google token"}, status=400)

        except Exception as e:
            print(f"Google token verification failed: {e}", flush=True)
            return Response({"error": "Invalid Google token"}, status=400)

        # Get or create user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email.split('@')[0] + '_' + str(random.randint(100, 999)),
                'first_name': name.split(' ')[0] if name else '',
                'last_name': ' '.join(name.split(' ')[1:]) if name else '',
            }
        )

        if created:
            user.set_unusable_password()
            user.save()
            print(f"Created new Google user: {email}", flush=True)

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.get_full_name() or user.username,
                "username": user.username,
            }
        })


# ============================================================
# GMAIL OAUTH2 — Connect Gmail for email parsing
# ============================================================

class GmailConnectView(APIView):
    """Redirects user to Google OAuth consent screen to authorize Gmail access."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        scopes = 'https://www.googleapis.com/auth/gmail.readonly'
        auth_url = (
            f"https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={settings.GOOGLE_CLIENT_ID}"
            f"&redirect_uri={urllib.parse.quote(settings.GOOGLE_REDIRECT_URI)}"
            f"&response_type=code"
            f"&scope={urllib.parse.quote(scopes)}"
            f"&access_type=offline"
            f"&prompt=consent"
            f"&state={request.user.id}"
        )
        return Response({"auth_url": auth_url})


class GmailCallbackView(APIView):
    """Handles the OAuth2 callback from Google after user authorizes Gmail access."""

    def get(self, request):
        code = request.query_params.get('code')
        user_id = request.query_params.get('state')
        error = request.query_params.get('error')

        if error:
            return redirect(f"{settings.FRONTEND_URL}/dashboard?gmail_error={error}")

        if not code or not user_id:
            return redirect(f"{settings.FRONTEND_URL}/dashboard?gmail_error=missing_params")

        # Exchange code for tokens
        try:
            token_url = "https://oauth2.googleapis.com/token"
            token_data = urllib.parse.urlencode({
                'code': code,
                'client_id': settings.GOOGLE_CLIENT_ID,
                'client_secret': settings.GOOGLE_CLIENT_SECRET,
                'redirect_uri': settings.GOOGLE_REDIRECT_URI,
                'grant_type': 'authorization_code',
            }).encode('utf-8')

            req = urllib.request.Request(token_url, data=token_data, method="POST")
            response = urllib.request.urlopen(req, timeout=15)
            token_result = json.loads(response.read().decode('utf-8'))

            access_token = token_result['access_token']
            refresh_token = token_result.get('refresh_token', '')
            expires_in = token_result.get('expires_in', 3600)

            # Get the user's Gmail address
            profile_url = "https://gmail.googleapis.com/gmail/v1/users/me/profile"
            profile_req = urllib.request.Request(
                profile_url,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            profile_response = urllib.request.urlopen(profile_req, timeout=10)
            profile_data = json.loads(profile_response.read().decode('utf-8'))
            gmail_email = profile_data.get('emailAddress', '')

            # Save or update connection
            user = User.objects.get(id=user_id)
            GmailConnection.objects.update_or_create(
                user=user,
                defaults={
                    'access_token': access_token,
                    'refresh_token': refresh_token,
                    'token_expiry': timezone.now() + timedelta(seconds=expires_in),
                    'gmail_email': gmail_email,
                    'is_active': True,
                }
            )

            print(f"Gmail connected for user {user.email} (Gmail: {gmail_email})", flush=True)
            return redirect(f"{settings.FRONTEND_URL}/dashboard?gmail_connected=true")

        except Exception as e:
            print(f"Gmail callback error: {e}", flush=True)
            return redirect(f"{settings.FRONTEND_URL}/dashboard?gmail_error=token_exchange_failed")


class GmailStatusView(APIView):
    """Check if the current user has Gmail connected."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            conn = request.user.gmail_connection
            return Response({
                "connected": conn.is_active,
                "email": conn.gmail_email,
                "connected_at": conn.connected_at.isoformat(),
            })
        except GmailConnection.DoesNotExist:
            return Response({"connected": False})


class GmailDisconnectView(APIView):
    """Disconnect Gmail from the user's account."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            conn = request.user.gmail_connection
            conn.is_active = False
            conn.save()
            return Response({"message": "Gmail disconnected"})
        except GmailConnection.DoesNotExist:
            return Response({"message": "No Gmail connection found"})