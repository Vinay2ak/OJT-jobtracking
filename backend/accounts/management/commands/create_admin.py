"""
One-time command to create an admin superuser.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Create admin superuser if not exists'

    def handle(self, *args, **options):
        email = 'admin@jobtracker.com'
        password = 'Admin@1906'
        username = 'admin'

        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'Admin user {email} already exists'))
            return

        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
        )
        self.stdout.write(self.style.SUCCESS(f'Superuser created: {email}'))
