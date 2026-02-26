from rest_framework import generics, permissions
from rest_framework import serializers
from .models import Intervention

class InterventionSerializer(serializers.ModelSerializer):
    student_name   = serializers.CharField(source='student.username',   read_only=True)
    counselor_name = serializers.CharField(source='counselor.username', read_only=True)
    class Meta:
        model  = Intervention
        fields = '__all__'
        read_only_fields = ['counselor', 'created_at']

class CreateInterventionView(generics.CreateAPIView):
    serializer_class   = InterventionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(counselor=self.request.user)

class InterventionListView(generics.ListAPIView):
    serializer_class   = InterventionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        student_id = self.request.query_params.get('student_id')
        return Intervention.objects.filter(student_id=student_id).order_by('-created_at')
