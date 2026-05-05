from apscheduler.schedulers.background import BackgroundScheduler
from django.core.management import call_command
import datetime

_first_run_done = False

def scan_gmail_task():
    global _first_run_done
    try:
        # One-time fix: enable email_consent for ALL existing jobs
        if not _first_run_done:
            _first_run_done = True
            try:
                from jobs.models import Job
                updated = Job.objects.filter(email_consent=False).update(email_consent=True)
                if updated:
                    print(f"🔧 Fixed {updated} jobs: enabled AI scanning for all.", flush=True)
            except Exception as e:
                print(f"Fix error: {e}", flush=True)

        now = datetime.datetime.now()
        print(f"[{now}] ⏰ Starting automatic Gmail scan...", flush=True)
        call_command('scan_emails')
        print(f"[{now}] ✅ Automatic Gmail scan completed.", flush=True)
    except Exception as e:
        print(f"❌ Error in automatic scan: {e}", flush=True)

def start():
    scheduler = BackgroundScheduler()
    scheduler.add_job(scan_gmail_task, 'interval', minutes=10)
    # Run once immediately on startup
    scheduler.add_job(scan_gmail_task, 'date')
    scheduler.start()
    print("✅ Gmail Background Scheduler started - Running every 10 minutes.", flush=True)
