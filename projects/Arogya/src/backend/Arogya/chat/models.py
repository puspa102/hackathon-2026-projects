from django.conf import settings
from django.db import models
from doctors.models import Doctor


class ChatMessage(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_messages"
    )
    doctor = models.ForeignKey(
        Doctor, on_delete=models.CASCADE, related_name="messages"
    )
    message = models.TextField()
    is_from_doctor = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Message from {self.sender.username} to {self.doctor.name}"
