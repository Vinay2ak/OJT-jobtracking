"""
Django management command to scan all users' Gmail for job status updates.
Run manually: python manage.py scan_emails
Schedule via Render Cron Job: every 15-30 minutes
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from jobs.email_parser import scan_user_emails

User = get_user_model()


class Command(BaseCommand):
    help = 'Scan Gmail for all connected users and update job statuses using AI'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-email',
            type=str,
            help='Scan only a specific user by email',
        )

    def handle(self, *args, **options):
        user_email = options.get('user_email')

        if user_email:
            try:
                user = User.objects.get(email=user_email)
                users = [user]
            except User.DoesNotExist:
                self.stderr.write(self.style.ERROR(f"User {user_email} not found"))
                return
        else:
            # Get all users with active Gmail connections
            users = User.objects.filter(
                gmail_connection__is_active=True
            ).select_related('gmail_connection')

        total_updates = 0
        self.stdout.write(f"Scanning emails for {len(users)} user(s)...")

        for user in users:
            try:
                count, updates = scan_user_emails(user)
                total_updates += count
                if count > 0:
                    self.stdout.write(self.style.SUCCESS(
                        f"  {user.email}: {count} job(s) updated"
                    ))
                    for u in updates:
                        self.stdout.write(
                            f"    - {u['company']} ({u['role']}): "
                            f"{u['old_status']} → {u['new_status']}"
                        )
                else:
                    self.stdout.write(f"  {user.email}: no updates")
            except Exception as e:
                self.stderr.write(self.style.ERROR(
                    f"  {user.email}: ERROR - {str(e)}"
                ))

        self.stdout.write(self.style.SUCCESS(
            f"\nDone! Total: {total_updates} job(s) updated across {len(users)} user(s)"
        ))
