# ── grades/admin.py ──────────────────────────────────────
from django.contrib import admin
from .models import GradeRecord

@admin.register(GradeRecord)
class GradeAdmin(admin.ModelAdmin):
    list_display  = ['student', 'subject', 'exam_type', 'score', 'total', 'date']
    list_filter   = ['exam_type', 'date']
    search_fields = ['student__username', 'subject']
