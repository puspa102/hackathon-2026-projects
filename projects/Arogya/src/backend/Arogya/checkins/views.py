from rest_framework import generics
from accounts.permissions import IsPatient
from .models import DailyCheckIn
from .serializers import DailyCheckInSerializer


class CheckInListCreateView(generics.ListCreateAPIView):
    serializer_class = DailyCheckInSerializer
    permission_classes = [IsPatient]

    def get_queryset(self):
        return DailyCheckIn.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)