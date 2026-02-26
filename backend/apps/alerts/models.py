from django.db import models
from apps.users.models import User

class Alert(models.Model):
    TYPE_CHOICES = [
        ('high_risk',  'High Risk Detected'),
        ('attendance', 'Low Attendance'),
        ('grade_drop', 'Grade Drop'),
        ('escalation', 'Case Escalated'),
    ]
    student    = models.ForeignKey(User, on_delete=models.CASCADE, related_name='alerts_received')
    sent_to    = models.ForeignKey(User, on_delete=models.CASCADE, related_name='alerts_sent_to')
    alert_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    message    = models.TextField()
    is_read    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Alert → {self.sent_to.username} | {self.alert_type}"
