from rest_framework import viewsets, permissions
from .models import Vaccine
from visualisation.models import IndividualVaccinationRecord
from .serializers import VaccineSerializer, IndividualVaccinationRecordSerializer

class VaccineViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List all available vaccines and their schedules.
    """
    queryset = Vaccine.objects.all()
    serializer_class = VaccineSerializer
    permission_classes = [permissions.IsAuthenticated]

class IndividualVaccinationRecordViewSet(viewsets.ModelViewSet):
    """
    Manage user's own vaccination records.
    """
    serializer_class = IndividualVaccinationRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # A user logged in will only see their data
        return IndividualVaccinationRecord.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
