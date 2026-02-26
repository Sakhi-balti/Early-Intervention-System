from django.urls import path
from .views import CreateInterventionView, InterventionListView

urlpatterns = [
    path('',     CreateInterventionView.as_view(), name='create-intervention'),
    path('list/', InterventionListView.as_view(),   name='intervention-list'),
]
