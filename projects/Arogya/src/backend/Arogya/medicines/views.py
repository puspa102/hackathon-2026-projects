from rest_framework import status, viewsets
from rest_framework.response import Response


class MedicineViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response([])

    def create(self, request):
        return Response(request.data, status=status.HTTP_201_CREATED)
