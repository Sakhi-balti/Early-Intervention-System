# ── interventions/admin.py ───────────────────────────────
from django.contrib import admin
from .models import Intervention

@admin.register(Intervention)
class InterventionAdmin(admin.ModelAdmin):
    list_display  = ['student', 'counselor', 'action_type', 'status', 'notes']
    list_filter   = ['action_type', 'status']
    search_fields = ['student__username']
