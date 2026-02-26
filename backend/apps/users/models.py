from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('student',   'Student'),
        ('teacher',   'Teacher'),
        ('counselor', 'Counselor'),
        ('admin',     'Admin'),
    ]
    role       = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    phone      = models.CharField(max_length=20, blank=True)
    department = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
