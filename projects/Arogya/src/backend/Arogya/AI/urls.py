from django.urls import path
from .views import ExtractReportAPIView

urlpatterns = [
    path("extract-report/", ExtractReportAPIView.as_view(), name="extract-report"),
]