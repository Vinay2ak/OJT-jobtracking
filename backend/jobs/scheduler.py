from apscheduler.schedulers.background import BackgroundScheduler
from django.core.management import call_command
import logging
import datetime

logger = logging.getLogger(__name__)

def scan_gmail_task():
    try:
        now = datetime.datetime.now()
        logger.info(f"[{now}] Starting automatic Gmail scan...")
        # This calls your 'python manage.py scan_emails' command automatically
        call_command('scan_emails')
    except Exception as e:
        logger.error(f"Error in automatic scan: {e}")

def start():
    scheduler = BackgroundScheduler()
    # Scans every 10 minutes. You can change this to 5 or 1 if you want it faster.
    scheduler.add_job(scan_gmail_task, 'interval', minutes=10)
    scheduler.start()
    logger.info("Gmail Background Scheduler started - Running every 10 minutes.")
