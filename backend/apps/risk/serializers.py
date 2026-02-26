from rest_framework import serializers
from .models import RiskScore

class RiskScoreSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.username', read_only=True)

    class Meta:
        model  = RiskScore
        fields = '__all__'
