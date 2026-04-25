from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsPatient
from rest_framework import generics


class ReportListCreateView(APIView):
    def get(self, request):
        return Response([])

    def post(self, request):
        return Response(request.data, status=status.HTTP_201_CREATED)




class ReportListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsPatient]   # 👈 ADD HERE