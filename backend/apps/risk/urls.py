from django.urls import path
from .views import StudentRiskView, AllHighRiskView

urlpatterns = [
    path('',     StudentRiskView.as_view(),  name='student-risk'),
    path('high/', AllHighRiskView.as_view(), name='high-risk-list'),
]
