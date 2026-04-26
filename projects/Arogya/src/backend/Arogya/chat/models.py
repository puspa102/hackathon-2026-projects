from django.conf import settings
from django.db import models


class ChatMessage(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_messages",
    )
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_messages",
        limit_choices_to={"role": "doctor"},
        null=True,
        blank=True,
    )
    message = models.TextField()
    is_from_doctor = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        doctor_name = self.doctor.username if self.doctor else "Unknown"
        return f"Message from {self.sender.username} to Dr.{doctor_name}"
