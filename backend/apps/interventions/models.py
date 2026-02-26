from django.db import models
from apps.users.models import User

class Intervention(models.Model):
    ACTION_TYPES = [
        ('counseling',   'Counseling Session'),
        ('parent_meet',  'Parent Meeting'),
        ('academic_help','Academic Support'),
        ('behavior',     'Behavior Guidance'),
        ('escalation',   'Escalated to Admin'),
    ]
    STATUS_CHOICES = [('pending','Pending'),('done','Done'),('escalated','Escalated')]

    student     = models.ForeignKey(User, on_delete=models.CASCADE, related_name='interventions')
    counselor   = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='assigned_interventions')
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    notes       = models.TextField(blank=True)
    status      = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    scheduled   = models.DateField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} | {self.action_type} | {self.status}"
