from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import AttendanceLog

@receiver(post_save, sender=AttendanceLog)
def trigger_risk_calculation(sender, instance, created, **kwargs):
    """
    Automatically recalculate risk score every time attendance is saved.
    This is what makes the system REAL-TIME.
    """
    if created:
        from apps.risk.calculator import calculate_and_save_risk
        calculate_and_save_risk(student_id=instance.student.id)
