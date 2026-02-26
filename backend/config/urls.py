"""
Root URL Configuration — Early Intervention System
All API endpoints are prefixed with /api/
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Django admin panel
    path('admin/', admin.site.urls),

    # ── All API routes ──────────────────────────────────────
    path('api/users/',         include('apps.users.urls')),
    path('api/attendance/',    include('apps.attendance.urls')),
    path('api/grades/',        include('apps.grades.urls')),
    path('api/risk/',          include('apps.risk.urls')),
    path('api/alerts/',        include('apps.alerts.urls')),
    path('api/interventions/', include('apps.interventions.urls')),
]

# ── Full API Reference ────────────────────────────────────
#
#  AUTH
#  POST   /api/users/register/       → create account
#  POST   /api/users/login/          → get JWT token
#  POST   /api/users/refresh/        → refresh token
#  GET    /api/users/profile/        → view own profile
#
#  ATTENDANCE
#  POST   /api/attendance/           → teacher marks attendance
#  GET    /api/attendance/list/      → get student attendance history
#
#  GRADES
#  POST   /api/grades/               → teacher adds grade
#  GET    /api/grades/list/          → get student grades
#
#  RISK
#  GET    /api/risk/?student_id=X    → get risk scores for student
#  GET    /api/risk/high/            → all high-risk students
#
#  ALERTS
#  GET    /api/alerts/               → counselor's unread alerts
#  PATCH  /api/alerts/<id>/read/     → mark alert as read
#
#  INTERVENTIONS
#  POST   /api/interventions/        → counselor assigns action
#  GET    /api/interventions/list/   → get student's interventions
