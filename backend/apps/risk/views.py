from rest_framework import generics, permissions
from .models import RiskScore
from .serializers import RiskScoreSerializer

class StudentRiskView(generics.ListAPIView):
    """GET /api/risk/?student_id=5  — latest risk scores for a student"""
    serializer_class   = RiskScoreSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        student_id = self.request.query_params.get('student_id')
        return RiskScore.objects.filter(student_id=student_id)[:10]

class AllHighRiskView(generics.ListAPIView):
    """GET /api/risk/high/  — all currently high-risk students"""
    serializer_class   = RiskScoreSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RiskScore.objects.filter(category='high').order_by('-calculated_at')
