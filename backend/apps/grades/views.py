from rest_framework import generics, permissions
from .models import GradeRecord
from .serializers import GradeSerializer

class AddGradeView(generics.CreateAPIView):
    serializer_class   = GradeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(entered_by=self.request.user)

class StudentGradesView(generics.ListAPIView):
    serializer_class   = GradeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        student_id = self.request.query_params.get('student_id')
        return GradeRecord.objects.filter(student_id=student_id).order_by('-date')
