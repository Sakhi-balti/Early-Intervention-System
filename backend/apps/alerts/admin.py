# ── alerts/admin.py ──────────────────────────────────────
from django.contrib import admin
from .models import Alert

@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display  = ['student', 'sent_to', 'alert_type', 'is_read', 'created_at']
    list_filter   = ['alert_type', 'is_read']
    search_fields = ['student__username']
    ordering      = ['-created_at']
