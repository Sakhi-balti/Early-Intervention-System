from django.db import models
from apps.users.models import User

class RiskScore(models.Model):
    CATEGORY_CHOICES = [('low','Low'),('medium','Medium'),('high','High')]

    student      = models.ForeignKey(User, on_delete=models.CASCADE, related_name='risk_scores')
    score        = models.FloatField()
    category     = models.CharField(max_length=10, choices=CATEGORY_CHOICES)
    attendance_pct = models.FloatField(default=0)
    grade_avg    = models.FloatField(default=0)
    incidents    = models.IntegerField(default=0)
    calculated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-calculated_at']

    def __str__(self):
        return f"{self.student.username} | Score:{self.score} | {self.category.upper()}"
