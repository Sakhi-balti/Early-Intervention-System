"""
backend/apps/interventions/apps.py
Registers intervention signals so Django loads them on startup.
"""

from django.apps import AppConfig


class InterventionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.interventions'

    def ready(self):
        import apps.interventions.signals  # ← activates the signal
