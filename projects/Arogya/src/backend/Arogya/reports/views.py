from rest_framework import generics
from .models import DischargeReport
from .serializers import DischargeReportSerializer
# Create your views here.

class ReportListCreateView(generics.ListCreateAPIView):
    serializer_class = DischargeReportSerializer

    def get_queryset(self):
        return DischargeReport.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
            extracted_text="AI extraction will be added later."
        )