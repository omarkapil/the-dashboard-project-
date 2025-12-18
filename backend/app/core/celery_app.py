from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

celery_app = Celery(
    "worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=['app.services.scan_tasks']
)



# Automated Scanning Schedule
celery_app.conf.beat_schedule = {
    "hourly-network-scan": {
        "task": "app.services.scan_tasks.trigger_periodic_scan",
        "schedule": crontab(minute=0), # Run every hour
        "args": ("localhost",), 
    },
}
