from rest_framework import serializers
from .models import AttendanceLog

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AttendanceLog
        fields = '__all__'
        read_only_fields = ['marked_by', 'created_at']
