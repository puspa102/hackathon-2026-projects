from django.urls import path

from .views import CheckInDetailView, CheckInListCreateView

urlpatterns = [
    path("", CheckInListCreateView.as_view()),
    path("<int:pk>/", CheckInDetailView.as_view()),
]
