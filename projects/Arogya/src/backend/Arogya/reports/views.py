from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import DischargeReport
from .serializers import DischargeReportSerializer


class ReportUploadView(generics.CreateAPIView):
    serializer_class = DischargeReportSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        report = serializer.save(patient=self.request.user)
        
        # Trigger text extraction
        from AI.services import AIService
        ai_service = AIService()
        
        try:
            extracted_text = ai_service.extract_text(report.file.path, report.file_type)
            if extracted_text:
                report.extracted_text = extracted_text
                report.save()
                
                # Automatically extract medications and add to patient profile
                meds = ai_service.extract_medications(extracted_text)
                if meds:
                    from medications.models import Medicine
                    for med_data in meds:
                        Medicine.objects.get_or_create(
                            patient=self.request.user,
                            name=med_data.get('name'),
                            defaults={
                                'dosage': med_data.get('dosage', 'As directed'),
                                'frequency': med_data.get('frequency', 'daily'),
                                'instructions': med_data.get('instructions', ''),
                                'start_date': timezone.now().date(),
                                'is_active': True
                            }
                        )
        except Exception as e:
            print(f"Extraction error: {e}")


class ReportListView(generics.ListAPIView):
    serializer_class = DischargeReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DischargeReport.objects.filter(patient=self.request.user)


class ReportDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = DischargeReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DischargeReport.objects.filter(patient=self.request.user)


class DoctorReportsView(generics.ListAPIView):
    """Doctor can see all pending reports from their patients."""

    serializer_class = DischargeReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role != "doctor":
            return DischargeReport.objects.none()
        from appointments.models import Appointment

        patient_ids = (
            Appointment.objects.filter(doctor=user)
            .values_list("patient_id", flat=True)
            .distinct()
        )
        return DischargeReport.objects.filter(patient__in=patient_ids).order_by(
            "-uploaded_at"
        )


class VerifyReportView(APIView):
    """Doctor verifies (approves) a patient report."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != "doctor":
            return Response(
                {"error": "Only doctors can verify reports."},
                status=status.HTTP_403_FORBIDDEN,
            )
        try:
            report = DischargeReport.objects.get(pk=pk)
        except DischargeReport.DoesNotExist:
            return Response(
                {"error": "Report not found."}, status=status.HTTP_404_NOT_FOUND
            )
        report.status = DischargeReport.Status.PROCESSED
        report.verified_by = request.user
        report.verified_at = timezone.now()
        report.save()
        return Response(
            DischargeReportSerializer(report).data, status=status.HTTP_200_OK
        )
