from rest_framework import serializers
from .models import GradeRecord

class GradeSerializer(serializers.ModelSerializer):
    percentage = serializers.ReadOnlyField()

    class Meta:
        model  = GradeRecord
        fields = '__all__'
        read_only_fields = ['entered_by']
