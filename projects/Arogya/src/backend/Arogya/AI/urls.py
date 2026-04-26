
from django.urls import path
from .views import SymptomCheckView, ReportAnalysisView, RecoveryChatView

urlpatterns = [
    path('symptom-check/', SymptomCheckView.as_view(), name='symptom_check'),
    path('analyze-report/', ReportAnalysisView.as_view(), name='analyze_report'),
    path('recovery-chat/', RecoveryChatView.as_view(), name='recovery_chat'),
]
