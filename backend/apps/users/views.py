from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User
from .serializers import RegisterSerializer, UserSerializer

class RegisterView(generics.CreateAPIView):
    queryset           = User.objects.all()
    serializer_class   = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class StudentListView(APIView):
    """GET /api/users/students/ — returns all users with role=student"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        students = User.objects.filter(role='student').values('id', 'username', 'email', 'department')
        return Response(list(students))
