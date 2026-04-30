"""
AI Email Parser — Uses Gmail API + Gemini AI to detect job status changes.
Scans user's Gmail for interview invites, offers, and rejections,
then updates job statuses automatically.
"""
import json
import re
import urllib.request
import urllib.parse
import logging
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)


def get_gemini_classification(email_subject, email_body, company_name, role_name):
    """Use Gemini AI to classify an email as interview/offer/rejection/none."""
    if not settings.GEMINI_API_KEY:
        print("GEMINI_API_KEY not set, falling back to keyword matching", flush=True)
        return keyword_fallback(email_subject, email_body)

    prompt = f"""You are an AI that classifies job application emails.

Given this email about a job application at "{company_name}" for the role "{role_name}":

Subject: {email_subject}
Body (first 1500 chars): {email_body[:1500]}

Classify this email into EXACTLY ONE category:
- "interview_scheduled" — if the email is scheduling/inviting for an interview (include meeting link and date if found)
- "offer" — if the email is extending a job offer
- "rejection" — if the email is a rejection/regret notice
- "none" — if the email is unrelated to job status (newsletters, job alerts, etc.)

Respond ONLY in this JSON format:
{{"classification": "interview_scheduled|offer|rejection|none", "meeting_link": "URL or empty", "interview_date": "ISO date or empty", "confidence": 0.0-1.0}}
"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.GEMINI_API_KEY}"
    data = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.1, "maxOutputTokens": 200}
    }

    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        response = urllib.request.urlopen(req, timeout=30)
        result = json.loads(response.read().decode("utf-8"))
        text = result["candidates"][0]["content"]["parts"][0]["text"]

        # Extract JSON from response
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        return {"classification": "none", "meeting_link": "", "interview_date": "", "confidence": 0.0}
    except Exception as e:
        print(f"Gemini API error: {e}", flush=True)
        return keyword_fallback(email_subject, email_body)


def keyword_fallback(subject, body):
    """Fallback classification using keywords when Gemini is unavailable."""
    text = (subject + " " + body).lower()

    # Extract meeting links
    meeting_link = ""
    link_patterns = [
        r'https?://[a-zA-Z0-9.-]*zoom\.us/[^\s<>"]+',
        r'https?://meet\.google\.com/[^\s<>"]+',
        r'https?://teams\.microsoft\.com/[^\s<>"]+',
    ]
    for pattern in link_patterns:
        match = re.search(pattern, subject + " " + body)
        if match:
            meeting_link = match.group()
            break

    # Classification based on keywords
    interview_keywords = ['interview', 'schedule', 'round', 'technical assessment', 'coding test',
                          'meet the team', 'discussion', 'call with', 'zoom', 'google meet', 'teams meeting']
    offer_keywords = ['offer letter', 'pleased to offer', 'congratulations', 'welcome aboard',
                      'job offer', 'compensation', 'start date', 'onboarding']
    rejection_keywords = ['unfortunately', 'regret to inform', 'not moving forward',
                          'position has been filled', 'other candidates', 'not selected',
                          'decided not to proceed', 'wish you the best']

    if any(kw in text for kw in offer_keywords):
        return {"classification": "offer", "meeting_link": "", "interview_date": "", "confidence": 0.7}
    if any(kw in text for kw in rejection_keywords):
        return {"classification": "rejection", "meeting_link": "", "interview_date": "", "confidence": 0.7}
    if any(kw in text for kw in interview_keywords):
        return {"classification": "interview_scheduled", "meeting_link": meeting_link, "interview_date": "", "confidence": 0.6}

    return {"classification": "none", "meeting_link": "", "interview_date": "", "confidence": 0.0}


def refresh_gmail_token(gmail_connection):
    """Refresh an expired Gmail OAuth2 access token."""
    from accounts.models import GmailConnection
    url = "https://oauth2.googleapis.com/token"
    data = urllib.parse.urlencode({
        'client_id': settings.GOOGLE_CLIENT_ID,
        'client_secret': settings.GOOGLE_CLIENT_SECRET,
        'refresh_token': gmail_connection.refresh_token,
        'grant_type': 'refresh_token',
    }).encode('utf-8')

    try:
        req = urllib.request.Request(url, data=data, method="POST")
        response = urllib.request.urlopen(req, timeout=15)
        token_data = json.loads(response.read().decode('utf-8'))

        gmail_connection.access_token = token_data['access_token']
        gmail_connection.token_expiry = timezone.now() + timedelta(seconds=token_data.get('expires_in', 3600))
        gmail_connection.save()
        return True
    except Exception as e:
        print(f"Token refresh failed: {e}", flush=True)
        return False


def search_gmail(access_token, query, max_results=10):
    """Search Gmail for messages matching a query."""
    url = f"https://gmail.googleapis.com/gmail/v1/users/me/messages?q={urllib.parse.quote(query)}&maxResults={max_results}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {access_token}"})
    try:
        response = urllib.request.urlopen(req, timeout=15)
        data = json.loads(response.read().decode('utf-8'))
        return data.get('messages', [])
    except Exception as e:
        print(f"Gmail search error: {e}", flush=True)
        return []


def get_email_content(access_token, message_id):
    """Get the subject and body of a specific email."""
    url = f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{message_id}?format=full"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {access_token}"})
    try:
        response = urllib.request.urlopen(req, timeout=15)
        data = json.loads(response.read().decode('utf-8'))

        # Extract subject
        headers = data.get('payload', {}).get('headers', [])
        subject = next((h['value'] for h in headers if h['name'].lower() == 'subject'), '')

        # Extract body
        body = ''
        payload = data.get('payload', {})
        if 'body' in payload and payload['body'].get('data'):
            import base64
            body = base64.urlsafe_b64decode(payload['body']['data']).decode('utf-8', errors='ignore')
        elif 'parts' in payload:
            for part in payload['parts']:
                if part.get('mimeType') == 'text/plain' and part.get('body', {}).get('data'):
                    import base64
                    body = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8', errors='ignore')
                    break

        return subject, body
    except Exception as e:
        print(f"Email content error: {e}", flush=True)
        return '', ''


def scan_user_emails(user):
    """Main function: scan a user's Gmail for job status updates."""
    from .models import Job, Interview, EmailScanLog

    try:
        gmail_conn = user.gmail_connection
    except Exception:
        print(f"No Gmail connection for {user.email}", flush=True)
        return 0, []

    if not gmail_conn.is_active:
        return 0, []

    # Refresh token if expired
    if gmail_conn.token_expiry <= timezone.now():
        if not refresh_gmail_token(gmail_conn):
            return 0, []

    access_token = gmail_conn.access_token
    jobs = Job.objects.filter(user=user, status__in=['applied', 'interviewing', 'interview', 'viewed'])
    updates = []
    emails_scanned = 0

    for job in jobs:
        # Search Gmail for emails mentioning this company
        # Search in all folders including spam
        query = f"from:{job.company} OR subject:{job.company} in:anywhere newer_than:30d"
        messages = search_gmail(access_token, query, max_results=5)
        emails_scanned += len(messages)

        for msg in messages:
            subject, body = get_email_content(access_token, msg['id'])
            if not subject and not body:
                continue

            # Classify email with AI
            result = get_gemini_classification(subject, body, job.company, job.role)

            if result['classification'] == 'none' or result.get('confidence', 0) < 0.5:
                continue

            # Update job status
            new_status = None
            if result['classification'] == 'interview_scheduled':
                new_status = 'interviewing'

                # Create interview record with meeting link
                interview_date = None
                if result.get('interview_date'):
                    try:
                        interview_date = datetime.fromisoformat(result['interview_date'])
                    except (ValueError, TypeError):
                        interview_date = timezone.now() + timedelta(days=3)  # Default 3 days from now
                else:
                    interview_date = timezone.now() + timedelta(days=3)

                Interview.objects.get_or_create(
                    job=job,
                    user=user,
                    defaults={
                        'scheduled_date': interview_date,
                        'meeting_link': result.get('meeting_link', ''),
                        'meeting_platform': detect_platform(result.get('meeting_link', '')),
                        'notes': f"Auto-detected from email: {subject}",
                    }
                )
            elif result['classification'] == 'offer':
                new_status = 'offered'
            elif result['classification'] == 'rejection':
                new_status = 'rejected'

            if new_status and job.status != new_status:
                old_status = job.status
                job.status = new_status
                job.save()
                updates.append({
                    'job_id': job.id,
                    'company': job.company,
                    'role': job.role,
                    'old_status': old_status,
                    'new_status': new_status,
                    'email_subject': subject,
                })
                print(f"Updated {job.company} - {job.role}: {old_status} -> {new_status}", flush=True)
                break  # Only apply first relevant email per job

    # Log the scan
    EmailScanLog.objects.create(
        user=user,
        emails_scanned=emails_scanned,
        updates_made=len(updates),
        details=json.dumps(updates)
    )

    return len(updates), updates


def detect_platform(url):
    """Detect meeting platform from URL."""
    if not url:
        return ''
    if 'zoom' in url.lower():
        return 'zoom'
    if 'meet.google' in url.lower():
        return 'google_meet'
    if 'teams.microsoft' in url.lower():
        return 'teams'
    return 'other'
