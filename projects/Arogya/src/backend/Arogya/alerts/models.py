from django.conf import settings
from django.db import models


class Alert(models.Model):
    """
    Alert model for health notifications and warnings.
    Alerts are generated based on patient check-ins, medication schedules, or doctor inputs.
    """

    ALERT_TYPE_CHOICES = [
        ("health_check", "Health Check Alert"),
        ("medication", "Medication Reminder"),
        ("appointment", "Appointment Reminder"),
        ("doctor_message", "Message from Doctor"),
        ("system", "System Alert"),
    ]

    SEVERITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("critical", "Critical"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="alerts"
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    alert_type = models.CharField(
        max_length=20, choices=ALERT_TYPE_CHOICES, default="system"
    )
    severity = models.CharField(
        max_length=20, choices=SEVERITY_CHOICES, default="medium"
    )
    related_checkin = models.ForeignKey(
        "checkins.DailyCheckIn",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="alerts",
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    acknowledged_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["severity", "is_read"]),
        ]

    def __str__(self):
        return f"{self.get_severity_display()} - {self.title} ({self.user.username})"

    def mark_as_read(self):
        """Mark alert as read by user."""
        if not self.is_read:
            self.is_read = True
            self.save()

    def acknowledge(self):
        """Mark alert as acknowledged by user."""
        from django.utils import timezone

        self.acknowledged_at = timezone.now()
        self.save()
