"""
backend/apps/attendance/apps.py
IMPORTANT — this file registers the signals so Django loads them on startup.
"""

from django.apps import AppConfig


class AttendanceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.attendance'

    def ready(self):
        import apps.attendance.signals  # ← this line activates the signal
