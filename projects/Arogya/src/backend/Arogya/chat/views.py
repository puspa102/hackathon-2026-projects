from rest_framework import generics, permissions
from .models import ChatMessage
from .serializers import ChatMessageSerializer
# Create your views here.

class ChatListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return ChatMessage.objects.filter(sender=self.request.user).order_by('-created_at')
        return ChatMessage.objects.none()

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)