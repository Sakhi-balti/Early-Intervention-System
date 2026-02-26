from django.db import models
from apps.users.models import User

class AttendanceLog(models.Model):
    STATUS_CHOICES = [('present', 'Present'), ('absent', 'Absent'), ('late', 'Late')]

    student    = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendance_logs')
    marked_by  = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='marked_attendance')
    date       = models.DateField()
    status     = models.CharField(max_length=10, choices=STATUS_CHOICES)
    class_name = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'date', 'class_name')

    def __str__(self):
        return f"{self.student.username} | {self.date} | {self.status}"
