from rest_framework import generics, permissions
from .models import AttendanceLog
from .serializers import AttendanceSerializer

class MarkAttendanceView(generics.CreateAPIView):
    """Teacher marks attendance — POST /api/attendance/"""
    serializer_class   = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(marked_by=self.request.user)

class AttendanceListView(generics.ListAPIView):
    """Get attendance records for a student — GET /api/attendance/?student_id=5"""
    serializer_class   = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        student_id = self.request.query_params.get('student_id')
        if student_id:
            return AttendanceLog.objects.filter(student_id=student_id).order_by('-date')
        return AttendanceLog.objects.none()
