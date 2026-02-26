from django.urls import path
from .views import MarkAttendanceView, AttendanceListView

urlpatterns = [
    path('',     MarkAttendanceView.as_view(), name='mark-attendance'),
    path('list/', AttendanceListView.as_view(), name='attendance-list'),
]
