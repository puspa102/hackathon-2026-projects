from django.urls import path

from .views import (
    DoctorReportsView,
    ReportDetailView,
    ReportListView,
    ReportUploadView,
    VerifyReportView,
)

urlpatterns = [
    path("upload/", ReportUploadView.as_view(), name="report-upload"),
    path("", ReportListView.as_view(), name="report-list"),
    path("doctor/", DoctorReportsView.as_view(), name="doctor-reports"),
    path("<int:pk>/", ReportDetailView.as_view(), name="report-detail"),
    path("<int:pk>/verify/", VerifyReportView.as_view(), name="verify-report"),
]
