from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Alert
from rest_framework import serializers

class AlertSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.username', read_only=True)
    class Meta:
        model  = Alert
        fields = '__all__'

class MyAlertsView(generics.ListAPIView):
    """GET /api/alerts/  — counselor sees their own alerts"""
    serializer_class   = AlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Alert.objects.filter(sent_to=self.request.user, is_read=False)

class MarkReadView(APIView):
    """PATCH /api/alerts/<id>/read/"""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        alert = Alert.objects.get(pk=pk, sent_to=request.user)
        alert.is_read = True
        alert.save()
        return Response({'status': 'marked as read'})
