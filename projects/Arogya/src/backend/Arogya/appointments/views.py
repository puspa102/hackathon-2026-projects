from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Appointment
from .serializers import AppointmentSerializer

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'doctor':
            return Appointment.objects.filter(doctor=user)
        return Appointment.objects.filter(patient=user)

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user)

    @action(detail=False, methods=['get'])
    def today(self, request):
        today = timezone.now().date()
        appointments = self.get_queryset().filter(scheduled_date=today)
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_patients(self, request):
        if request.user.role != 'doctor':
            return Response({"error": "Only doctors can view their patients"}, status=403)
        
        appointments = Appointment.objects.filter(doctor=request.user).select_related('patient')
        patients = []
        seen_ids = set()
        for appt in appointments:
            if appt.patient.id not in seen_ids:
                patients.append({
                    "id": appt.patient.id,
                    "full_name": f"{appt.patient.first_name} {appt.patient.last_name}".strip() or appt.patient.username,
                    "phone": appt.patient.phone
                })
                seen_ids.add(appt.patient.id)
        
        return Response(patients)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        appointment = self.get_object()
        new_status = request.data.get('status')
        if not new_status:
            return Response({"error": "Status is required"}, status=400)
        
        appointment.status = new_status
        appointment.save()
        return Response(self.get_serializer(appointment).data)
