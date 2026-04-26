from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import ChatMessage
from .serializers import ChatMessageSerializer


class ChatListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "doctor":
            # Doctor sees all messages addressed to them
            return ChatMessage.objects.filter(doctor=user).order_by("created_at")
        else:
            # Patient sees all their sent messages
            return ChatMessage.objects.filter(sender=user).order_by("created_at")

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == "doctor":
            # Doctor is replying — is_from_doctor=True, sender=doctor user
            serializer.save(sender=user, is_from_doctor=True)
        else:
            # Patient is sending — is_from_doctor=False
            serializer.save(sender=user, is_from_doctor=False)
