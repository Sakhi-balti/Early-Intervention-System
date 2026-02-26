from django.urls import path
from .views import AddGradeView, StudentGradesView

urlpatterns = [
    path('',     AddGradeView.as_view(),     name='add-grade'),
    path('list/', StudentGradesView.as_view(), name='student-grades'),
]
