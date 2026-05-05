from django.apps import AppConfig

# Global flag to prevent the scheduler from starting twice
_scheduler_started = False


class JobsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'jobs'

    def ready(self):
        global _scheduler_started
        if not _scheduler_started:
            _scheduler_started = True
            try:
                from . import scheduler
                scheduler.start()
                print("✅ Gmail Background Scheduler has been started!", flush=True)
            except Exception as e:
                print(f"❌ Scheduler failed to start: {e}", flush=True)
