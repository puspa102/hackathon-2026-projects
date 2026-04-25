from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class CheckInListCreateView(APIView):
    def get(self, request):
        return Response([])

    def post(self, request):
        return Response(request.data, status=status.HTTP_201_CREATED)
