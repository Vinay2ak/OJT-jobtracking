"""
AI Email Parser — Uses Gmail API + Gemini AI to detect job status changes.
Scans user's Gmail for interview invites, offers, and rejections,
then updates job statuses automatically.

PRECISION RULES:
1. Only match emails that mention BOTH company name AND role/position
2. Status can only move FORWARD (applied→interviewing→offered→accepted), never backwards
3. Rejection is always final — can happen from any status
4. AI confidence must be >= 0.7 for status updates
5. Sender email domain should match company when possible
"""
import json
import re
import base64
import urllib.request
import urllib.parse
import logging
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

# Status progression order — status can only move FORWARD, never back
STATUS_RANK = {
    'applied': 1,
    'viewed': 2,
    'interviewing': 3,
    'interview': 3,
    'offered': 4,
    'offer': 4,
    'accepted': 5,
    'rejected': 99,   # rejection can happen from any stage
    'withdrawn': 100,
}


def is_valid_status_transition(current_status, new_status):
    """
    Ensure status only moves FORWARD.
    Example: applied → interviewing ✅
             interviewing → applied ❌ (going backwards)
             applied → rejected ✅ (rejection is always valid)
    """
    current_rank = STATUS_RANK.get(current_status, 0)
    new_rank = STATUS_RANK.get(new_status, 0)

    # Rejection and withdrawal can happen from any stage
    if new_status in ('rejected', 'withdrawn'):
        return True

    # New status must be higher rank than current
    return new_rank > current_rank


def get_gemini_classification(email_subject, email_body, company_name, role_name, sender_email=''):
    """Use Gemini AI to classify an email as interview/offer/rejection/none."""
    if not settings.GEMINI_API_KEY:
        print("GEMINI_API_KEY not set, falling back to keyword matching", flush=True)
        return keyword_fallback(email_subject, email_body, company_name)

    prompt = f"""You are a STRICT AI that classifies job application emails.
You MUST verify the email is ACTUALLY about a specific job application before classifying.

CONTEXT:
- The user applied at company: "{company_name}"
- For the role: "{role_name}"
- Sender email: {sender_email}

EMAIL TO ANALYZE:
Subject: {email_subject}
Body (first 2000 chars): {email_body[:2000]}

STRICT RULES:
1. The email MUST be specifically about this company AND this role (or a closely matching role)
2. Generic job alerts, newsletters, promotional emails = "none"
3. Emails from job boards (LinkedIn notifications, Naukri alerts) that just list jobs = "none"
4. Only classify as interview/offer/rejection if the email is DIRECTLY from the company or their recruiter
5. The email body must clearly indicate a status change, not just an acknowledgement
6. "We received your application" or "Thank you for applying" = "none" (this is just confirmation, not a status change)

CLASSIFY into EXACTLY ONE:
- "interview_scheduled" — ONLY if they are explicitly inviting for an interview round, assessment, or call. Must mention specific time/date or ask to schedule.
- "offer" — ONLY if they are formally extending a job offer with compensation details or start date
- "rejection" — ONLY if they clearly state the candidate is not selected / not moving forward
- "none" — Everything else (confirmations, newsletters, alerts, unrelated emails)

ALSO EXTRACT (if interview_scheduled):
- meeting_link: Zoom/Meet/Teams URL if present
- interview_date: Date/time in ISO format if mentioned

Respond ONLY in JSON:
{{"classification": "interview_scheduled|offer|rejection|none", "meeting_link": "URL or empty", "interview_date": "ISO date or empty", "confidence": 0.0-1.0, "reason": "brief explanation"}}
"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.GEMINI_API_KEY}"
    data = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.05, "maxOutputTokens": 300}
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
            parsed = json.loads(json_match.group())
            print(f"  Gemini result for {company_name}: {parsed.get('classification')} "
                  f"(confidence: {parsed.get('confidence')}, reason: {parsed.get('reason', 'N/A')})", flush=True)
            return parsed
        return {"classification": "none", "meeting_link": "", "interview_date": "", "confidence": 0.0}
    except Exception as e:
        print(f"Gemini API error: {e}", flush=True)
        return keyword_fallback(email_subject, email_body, company_name)


def keyword_fallback(subject, body, company_name=''):
    """Fallback classification using keywords when Gemini is unavailable."""
    text = (subject + " " + body).lower()
    company_lower = company_name.lower() if company_name else ''

    # FIRST CHECK: Does the email even mention the company?
    if company_lower and company_lower not in text:
        return {"classification": "none", "meeting_link": "", "interview_date": "", "confidence": 0.0}

    # Skip common non-status emails
    skip_phrases = ['thank you for applying', 'application received', 'we received your',
                    'job alert', 'new jobs', 'similar jobs', 'recommended for you',
                    'unsubscribe', 'email preferences', 'newsletter']
    if any(phrase in text for phrase in skip_phrases):
        return {"classification": "none", "meeting_link": "", "interview_date": "", "confidence": 0.0}

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

    # Offer keywords (most specific first)
    offer_keywords = ['offer letter', 'pleased to offer', 'we are delighted to offer',
                      'welcome aboard', 'formal offer', 'compensation package',
                      'we would like to extend an offer']
    # Rejection keywords
    rejection_keywords = ['unfortunately', 'regret to inform', 'not moving forward',
                          'position has been filled', 'decided to move forward with other',
                          'not selected', 'decided not to proceed', 'will not be moving',
                          'after careful consideration']
    # Interview keywords (require action words, not just "interview" mention)
    interview_keywords = ['schedule an interview', 'invite you for', 'interview scheduled',
                          'please join', 'round of interview', 'technical round',
                          'assessment link', 'coding challenge', 'interview on',
                          'meeting invite', 'would like to discuss your application']

    if any(kw in text for kw in offer_keywords):
        return {"classification": "offer", "meeting_link": "", "interview_date": "", "confidence": 0.75}
    if any(kw in text for kw in rejection_keywords):
        return {"classification": "rejection", "meeting_link": "", "interview_date": "", "confidence": 0.75}
    if any(kw in text for kw in interview_keywords):
        return {"classification": "interview_scheduled", "meeting_link": meeting_link, "interview_date": "", "confidence": 0.65}

    return {"classification": "none", "meeting_link": "", "interview_date": "", "confidence": 0.0}


def refresh_gmail_token(gmail_connection):
    """Refresh an expired Gmail OAuth2 access token."""
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
    """Get the subject, body, and sender of a specific email."""
    url = f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{message_id}?format=full"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {access_token}"})
    try:
        response = urllib.request.urlopen(req, timeout=15)
        data = json.loads(response.read().decode('utf-8'))

        # Extract headers
        headers = data.get('payload', {}).get('headers', [])
        subject = next((h['value'] for h in headers if h['name'].lower() == 'subject'), '')
        sender = next((h['value'] for h in headers if h['name'].lower() == 'from'), '')
        date_str = next((h['value'] for h in headers if h['name'].lower() == 'date'), '')

        # Extract body (try plain text first, then HTML)
        body = ''
        payload = data.get('payload', {})

        def extract_body_from_parts(parts):
            """Recursively extract text from email parts."""
            for part in parts:
                mime = part.get('mimeType', '')
                if mime == 'text/plain' and part.get('body', {}).get('data'):
                    return base64.urlsafe_b64decode(part['body']['data']).decode('utf-8', errors='ignore')
                if 'parts' in part:
                    result = extract_body_from_parts(part['parts'])
                    if result:
                        return result
            return ''

        if 'body' in payload and payload['body'].get('data'):
            body = base64.urlsafe_b64decode(payload['body']['data']).decode('utf-8', errors='ignore')
        elif 'parts' in payload:
            body = extract_body_from_parts(payload['parts'])

        return subject, body, sender, date_str
    except Exception as e:
        print(f"Email content error: {e}", flush=True)
        return '', '', '', ''


def email_matches_company(sender_email, subject, body, company_name):
    """
    Verify that an email is actually from/about a specific company.
    Returns True only if there's a strong match.
    """
    company_lower = company_name.lower().strip()
    sender_lower = sender_email.lower()
    text_lower = (subject + " " + body).lower()

    # Check 1: Company name appears in sender email domain
    # e.g., "hr@google.com" matches "Google"
    company_words = company_lower.replace('.', ' ').replace('-', ' ').split()
    sender_domain = sender_lower.split('@')[-1] if '@' in sender_lower else ''
    for word in company_words:
        if len(word) >= 3 and word in sender_domain:
            return True

    # Check 2: Company name appears in sender display name
    # e.g., "Google Recruiting <noreply@google.com>"
    if company_lower in sender_lower:
        return True

    # Check 3: Company name appears in the email subject
    if company_lower in (subject.lower()):
        return True

    # Check 4: Company name appears multiple times in body (strong signal)
    company_count = text_lower.count(company_lower)
    if company_count >= 2:
        return True

    return False


def scan_user_emails(user):
    """
    Main function: scan a user's Gmail for job status updates.
    PRECISION-OPTIMIZED: Only updates status when there's high confidence match.
    """
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

    # Only scan jobs that can still receive updates
    jobs = Job.objects.filter(
        user=user,
        status__in=['applied', 'viewed', 'interviewing', 'interview']
    )
    updates = []
    emails_scanned = 0
    already_scanned_msg_ids = set()

    print(f"\n=== Scanning emails for {user.email} ({jobs.count()} active jobs) ===", flush=True)

    for job in jobs:
        print(f"\n  Checking: {job.company} - {job.role} (current: {job.status})", flush=True)

        # PRECISE Gmail search: company name in subject OR from company domain
        # Use quotes to match exact company name, not partial words
        company_query = f'"{job.company}"'
        query = f'({company_query}) in:anywhere newer_than:30d -category:promotions -category:social'
        messages = search_gmail(access_token, query, max_results=5)
        emails_scanned += len(messages)

        if not messages:
            print(f"    No emails found for {job.company}", flush=True)
            continue

        for msg in messages:
            # Skip already processed emails in this scan
            if msg['id'] in already_scanned_msg_ids:
                continue
            already_scanned_msg_ids.add(msg['id'])

            subject, body, sender, date_str = get_email_content(access_token, msg['id'])
            if not subject and not body:
                continue

            # VERIFICATION: Does this email actually match this company?
            if not email_matches_company(sender, subject, body, job.company):
                print(f"    Skipping email (sender '{sender}' doesn't match '{job.company}')", flush=True)
                continue

            print(f"    Analyzing email: '{subject}' from {sender}", flush=True)

            # Classify with AI
            result = get_gemini_classification(subject, body, job.company, job.role, sender)

            # STRICT: Require confidence >= 0.7 for any status change
            confidence = result.get('confidence', 0)
            if result['classification'] == 'none' or confidence < 0.7:
                print(f"    Skipped: {result['classification']} (confidence: {confidence})", flush=True)
                continue

            # Determine new status
            new_status = None
            if result['classification'] == 'interview_scheduled':
                new_status = 'interviewing'
            elif result['classification'] == 'offer':
                new_status = 'offered'
            elif result['classification'] == 'rejection':
                new_status = 'rejected'

            if not new_status:
                continue

            # SAFETY: Verify status transition is valid (no going backwards)
            if not is_valid_status_transition(job.status, new_status):
                print(f"    Blocked invalid transition: {job.status} → {new_status}", flush=True)
                continue

            # All checks passed — update the job status
            old_status = job.status
            job.status = new_status
            job.save()

            # Create interview record if interview detected
            if new_status == 'interviewing':
                interview_date = None
                if result.get('interview_date'):
                    try:
                        interview_date = datetime.fromisoformat(result['interview_date'])
                        if timezone.is_naive(interview_date):
                            interview_date = timezone.make_aware(interview_date)
                    except (ValueError, TypeError):
                        interview_date = timezone.now() + timedelta(days=3)
                else:
                    interview_date = timezone.now() + timedelta(days=3)

                Interview.objects.get_or_create(
                    job=job,
                    user=user,
                    defaults={
                        'scheduled_date': interview_date,
                        'meeting_link': result.get('meeting_link', '') or '',
                        'meeting_platform': detect_platform(result.get('meeting_link', '')),
                        'notes': f"Auto-detected from email: {subject}",
                    }
                )

            updates.append({
                'job_id': job.id,
                'company': job.company,
                'role': job.role,
                'old_status': old_status,
                'new_status': new_status,
                'email_subject': subject,
                'confidence': confidence,
                'reason': result.get('reason', ''),
            })
            print(f"    ✅ UPDATED: {job.company} - {job.role}: {old_status} → {new_status} "
                  f"(confidence: {confidence})", flush=True)
            break  # Only apply first relevant email per job

    # Log the scan
    EmailScanLog.objects.create(
        user=user,
        emails_scanned=emails_scanned,
        updates_made=len(updates),
        details=json.dumps(updates)
    )

    print(f"\n=== Scan complete: {len(updates)} updates from {emails_scanned} emails ===\n", flush=True)
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
