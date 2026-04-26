from rest_framework import generics, permissions
from .models import DailyCheckIn
from .serializers import DailyCheckInSerializer

# Create your views here.

class CheckInListCreateView(generics.ListCreateAPIView):
    serializer_class = DailyCheckInSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return DailyCheckIn.objects.filter(user=self.request.user).order_by('-created_at')
        return DailyCheckIn.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)