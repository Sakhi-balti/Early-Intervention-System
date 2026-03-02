# ── risk/admin.py ────────────────────────────────────────
from django.contrib import admin
from .models import RiskScore

@admin.register(RiskScore)
class RiskAdmin(admin.ModelAdmin):
    list_display  = ['student', 'score', 'category', 'attendance_pct', 'grade_avg', 'incidents', 'calculated_at']
    list_filter   = ['category']
    search_fields = ['student__username']
    ordering      = ['-calculated_at']
