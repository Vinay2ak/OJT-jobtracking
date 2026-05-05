from apscheduler.schedulers.background import BackgroundScheduler
from django.core.management import call_command
import datetime

def scan_gmail_task():
    try:
        now = datetime.datetime.now()
        print(f"[{now}] ⏰ Starting automatic Gmail scan...", flush=True)
        # This calls your 'python manage.py scan_emails' command automatically
        call_command('scan_emails')
        print(f"[{now}] ✅ Automatic Gmail scan completed.", flush=True)
    except Exception as e:
        print(f"❌ Error in automatic scan: {e}", flush=True)

def start():
    scheduler = BackgroundScheduler()
    # Scans every 10 minutes
    scheduler.add_job(scan_gmail_task, 'interval', minutes=10)
    # Also run once immediately on startup so you don't have to wait 10 mins
    scheduler.add_job(scan_gmail_task, 'date')
    scheduler.start()
    print("✅ Gmail Background Scheduler started - Running every 10 minutes.", flush=True)
