import os
import json
import base64
import re
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from django.conf import settings
from .models import Job
from .utils import notify_user
from .serializers import JobSerializer

# If modifying these SCOPES, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

def get_gmail_service():
    """Sets up the Gmail API service using token.json."""
    creds = None
    # Path to token.json and client_secret.json (base directory of the backend)
    creds_path = os.path.join(settings.BASE_DIR, 'token.json')
    client_secret_path = os.path.join(settings.BASE_DIR, 'client_secret.json')

    if os.path.exists(creds_path):
        creds = Credentials.from_authorized_user_file(creds_path, SCOPES)
    
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # Note: This part might fail in a headless/server environment without interaction
            # But since token.json already exists, we assume it's valid or refreshable.
            flow = InstalledAppFlow.from_client_secrets_file(client_secret_path, SCOPES)
            creds = flow.run_local_server(port=0)
        
        # Save the credentials for the next run
        with open(creds_path, 'w') as token:
            token.write(creds.to_json())

    return build('gmail', 'v1', credentials=creds)

def parse_status_from_text(text):
    """Maps keywords in email text to standardized job statuses."""
    text = text.lower()
    
    # Rejected keywords
    if any(k in text for k in ["rejected", "regret", "not moving forward", "no longer considering", "unsuccessful", "position has been filled"]):
        return "rejected"
    
    # Interview keywords
    if any(k in text for k in ["interview", "schedule", "talk next", "shortlisted", "availability", "phone call"]):
        return "interview"
        
    # Offer keywords
    if any(k in text for k in ["offer", "congratulations", "letter of intent", "hired", "offer letter"]):
        return "offer"
        
    return None

def sync_jobs_with_gmail(user):
    """Searches for updates for all 'Applied' jobs for a specific user."""
    service = get_gmail_service()
    # Get all jobs that are currently in 'applied' status
    jobs_to_track = Job.objects.filter(user=user, status__in=['applied', 'viewed'])
    
    updated_count = 0
    results = []

    for job in jobs_to_track:
        # Construct search query: Company Name AND (Role OR "application")
        # We use a broad search first
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
                        break # Found update for this job, move to next
                        
        except Exception as e:
            print(f"Error syncing {job.company}: {str(e)}")
            continue

    return updated_count, results
