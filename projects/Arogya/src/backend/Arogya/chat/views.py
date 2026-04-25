from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import ChatMessage
from .serializers import ChatMessageSerializer
from rest_framework.authentication import TokenAuthentication

class ChatListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]   # 🔥 IMPORTANT

    def get_queryset(self):
        return ChatMessage.objects.filter(
            sender=self.request.user
        ).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)