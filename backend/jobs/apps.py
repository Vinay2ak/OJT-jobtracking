from django.apps import AppConfig


class JobsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'jobs'

    def ready(self):
        import os
        # Ensure it only runs once and not during migrations or development reloads
        if os.environ.get('RUN_MAIN') == 'true' or not os.environ.get('DJANGO_SETTINGS_MODULE'):
             # This block starts the automatic scanning
             from . import scheduler
             scheduler.start()
