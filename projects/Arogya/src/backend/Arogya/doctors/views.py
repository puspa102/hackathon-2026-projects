from rest_framework import generics
from rest_framework.response import Response
from .models import Doctor
from .serializers import DoctorSerializer

# Create your views here.

class DoctorListView(generics.ListAPIView):
    serializer_class = DoctorSerializer

    def get_queryset(self):
        return Doctor.objects.filter(available=True)


class NearbyDoctorView(generics.ListAPIView):
    serializer_class = DoctorSerializer

    def get_queryset(self):
        # TODO: Implement location-based filtering
        return Doctor.objects.filter(available=True)