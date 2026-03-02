"""
backend/apps/grades/apps.py
Registers grade signals so Django loads them on startup.
"""

from django.apps import AppConfig


class GradesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.grades'

    def ready(self):
        import apps.grades.signals  # ← activates the signal
