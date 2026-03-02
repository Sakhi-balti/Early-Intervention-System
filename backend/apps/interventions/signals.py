"""
backend/apps/interventions/signals.py
Triggers risk recalculation when a new intervention/incident is recorded.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Intervention


@receiver(post_save, sender=Intervention)
def trigger_risk_on_incident(sender, instance, created, **kwargs):
    if created:
        print(f"📡 Incident signal triggered for student {instance.student_id}")
        try:
            from apps.risk.calculator import calculate_and_save_risk
            calculate_and_save_risk(student_id=instance.student.id)
        except Exception as e:
            print(f"❌ Risk calculation failed: {e}")
