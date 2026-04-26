from django.urls import path
from .views import AIRootView, ExtractReportAPIView, SymptomAnalysisAPIView, RecoveryChatAPIView

urlpatterns = [
    path("", AIRootView.as_view(), name="ai-root"),
    path("extract-report/", ExtractReportAPIView.as_view(), name="extract-report"),
    path("symptom-analysis/", SymptomAnalysisAPIView.as_view(), name="symptom-analysis"),
    path("chat/", RecoveryChatAPIView.as_view(), name="recovery-chat"),
]