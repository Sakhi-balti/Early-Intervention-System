from django.db import models
from apps.users.models import User

class GradeRecord(models.Model):
    EXAM_TYPES = [('quiz','Quiz'),('midterm','Midterm'),('final','Final'),('assignment','Assignment')]

    student    = models.ForeignKey(User, on_delete=models.CASCADE, related_name='grades')
    subject    = models.CharField(max_length=100)
    exam_type  = models.CharField(max_length=20, choices=EXAM_TYPES)
    score      = models.FloatField()
    total      = models.FloatField(default=100)
    date       = models.DateField()
    entered_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='entered_grades')

    def percentage(self):
        return round((self.score / self.total) * 100, 2)

    def __str__(self):
        return f"{self.student.username} | {self.subject} | {self.score}/{self.total}"
