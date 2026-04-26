from rest_framework import viewsets, permissions
from .models import Medicine
from .serializers import MedicineSerializer

# Create your views here.

class MedicineViewSet(viewsets.ModelViewSet):
    serializer_class = MedicineSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Medicine.objects.filter(user=self.request.user)
        return Medicine.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)