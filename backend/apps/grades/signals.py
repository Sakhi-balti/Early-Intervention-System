"""
backend/apps/grades/signals.py
Triggers risk recalculation when a new grade is saved.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import GradeRecord


@receiver(post_save, sender=GradeRecord)
def trigger_risk_on_grade(sender, instance, created, **kwargs):
    if created:
        print(f"📡 Grade signal triggered for student {instance.student_id}")
        try:
            from apps.risk.calculator import calculate_and_save_risk
            calculate_and_save_risk(student_id=instance.student.id)
        except Exception as e:
            print(f"❌ Risk calculation failed: {e}")
