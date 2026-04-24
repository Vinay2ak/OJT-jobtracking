import os
import json
import base64
import re
import logging
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from django.conf import settings
from .models import Job
from .utils import notify_user
from .serializers import JobSerializer

logger = logging.getLogger(__name__)

# If modifying these SCOPES, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

def get_gmail_service():
    """Sets up the Gmail API service using token.json."""
    creds = None
    # Path to token.json and client_secret.json (base directory of the backend)
    creds_path = os.path.join(settings.BASE_DIR, 'token.json')
    client_secret_path = os.path.join(settings.BASE_DIR, 'client_secret.json')

    if not os.path.exists(creds_path):
        raise Exception(
            "Gmail token.json not found. Please run the OAuth flow locally first "
            "to generate token.json before deploying."
        )

    creds = Credentials.from_authorized_user_file(creds_path, SCOPES)
    
    # If there are no (valid) credentials available, try to refresh.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                # Save the refreshed credentials
                with open(creds_path, 'w') as token:
                    token.write(creds.to_json())
            except Exception as e:
                raise Exception(
                    f"Failed to refresh Gmail credentials: {e}. "
                    "Please re-run the OAuth flow locally to generate a new token.json."
                )
        else:
            raise Exception(
                "Gmail credentials are invalid and cannot be refreshed. "
                "Please re-run the OAuth flow locally to generate a new token.json."
            )

    return build('gmail', 'v1', credentials=creds)

def parse_status_from_text(text):
    """Maps keywords in email text to standardized job statuses."""
    text = text.lower()
    
    # Rejected keywords (check first — most common update)
    rejected_keywords = [
        "rejected", "regret", "not moving forward", "no longer considering",
        "unsuccessful", "position has been filled", "not selected",
        "we have decided to move forward with other candidates",
        "after careful consideration", "will not be proceeding",
        "not a match", "not shortlisted", "application was not successful"
    ]
    if any(k in text for k in rejected_keywords):
        return "rejected"
    
    # Offer keywords (check before interview — offer is more specific)
    offer_keywords = [
        "offer", "congratulations", "letter of intent", "hired",
        "offer letter", "welcome aboard", "pleased to offer",
        "we are excited to extend", "compensation package"
    ]
    if any(k in text for k in offer_keywords):
        return "offer"
    
    # Interview keywords
    interview_keywords = [
        "interview", "schedule", "talk next", "shortlisted",
        "availability", "phone call", "technical round",
        "coding challenge", "assessment", "phone screen",
        "next steps in the process", "meet the team",
        "we would like to invite you"
    ]
    if any(k in text for k in interview_keywords):
        return "interview"
        
    return None

def sync_jobs_with_gmail(user):
    """Searches for updates for all 'Applied' jobs for a specific user."""
    service = get_gmail_service()
    # Get all jobs that are currently in 'applied' or 'viewed' status
    jobs_to_track = Job.objects.filter(user=user, status__in=['applied', 'viewed'])
    
    updated_count = 0
    results = []

    for job in jobs_to_track:
        # Construct search query: Company Name AND (Role OR "application")
        query = f'"{job.company}"'
        
        try:
            # Search messages
            response = service.users().messages().list(userId='me', q=query, maxResults=5).execute()
            messages = response.get('messages', [])
            
            for msg in messages:
                # Get full message content
                message = service.users().messages().get(userId='me', id=msg['id']).execute()
                snippet = message.get('snippet', '')
                
                # Use snippet for quick check, or join snippet with subject
                headers = message.get('payload', {}).get('headers', [])
                subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '')
                
                full_text = f"{subject} {snippet}"
                
                # Check if role matches (even partially) to be sure it's the same application
                # Fuzzier matching: if role is "Software Engineer", check for Engineer or Software
                role_keywords = job.role.lower().split()
                role_match = any(k in full_text.lower() for k in role_keywords if len(k) > 3)
                
                if role_match:
                    new_status = parse_status_from_text(full_text)
                    
                    if new_status and new_status != job.status:
                        job.status = new_status
                        job.save()
                        updated_count += 1
                        
                        job_data = JobSerializer(job).data
                        results.append(job_data)
                        
                        # Notify Dashboard in real-time
                        notify_user(user.id, "job_updated", {"job": job_data})
                        break  # Found update for this job, move to next
                        
        except Exception as e:
            logger.error(f"Error syncing {job.company}: {str(e)}")
            continue

    return updated_count, results
