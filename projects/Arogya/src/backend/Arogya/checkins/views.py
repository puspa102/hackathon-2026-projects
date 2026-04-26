from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import DailyCheckIn
from .serializers import DailyCheckInSerializer


class CheckInListCreateView(generics.ListCreateAPIView):
    serializer_class = DailyCheckInSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DailyCheckIn.objects.filter(user=self.request.user).order_by(
            "-created_at"
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CheckInDetailView(generics.RetrieveAPIView):
    serializer_class = DailyCheckInSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DailyCheckIn.objects.filter(user=self.request.user)
