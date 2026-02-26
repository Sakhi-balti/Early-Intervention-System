from django.urls import path
from .views import MyAlertsView, MarkReadView

urlpatterns = [
    path('',           MyAlertsView.as_view(), name='my-alerts'),
    path('<int:pk>/read/', MarkReadView.as_view(), name='mark-read'),
]
