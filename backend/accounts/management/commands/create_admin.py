"""
One-time command to create an admin superuser.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Create admin superuser (force reset if exists)'

    def handle(self, *args, **options):
        email = 'admin@jobtracker.com'
        password = 'Admin@1906'
        username = 'admin'

        # Delete existing admin if exists and recreate fresh
        User.objects.filter(email=email).delete()
        User.objects.filter(username=username).delete()

        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
        )
        user.is_active = True
        user.is_staff = True
        user.is_superuser = True
        user.save()

        self.stdout.write(self.style.SUCCESS(
            f'Superuser created: email={email}, password={password}'
        ))
