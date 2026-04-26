from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import DailyCheckIn


@receiver(post_save, sender=DailyCheckIn)
def create_alert_on_checkin(sender, instance, created, **kwargs):
    """
    Automatically create an alert when a check-in has warning or emergency risk level.
    """
    if not created:
        return

    if instance.risk_level == "normal":
        return

    from alerts.models import Alert

    if instance.risk_level == "emergency":
        Alert.objects.create(
            user=instance.user,
            title="🚨 Emergency Risk Detected",
            message=instance.guidance
            or "Emergency warning based on your latest check-in. Please contact emergency services immediately.",
            alert_type="health_check",
            severity="critical",
            related_checkin=instance,
        )
    elif instance.risk_level == "warning":
        Alert.objects.create(
            user=instance.user,
            title="⚠️ Health Warning",
            message=instance.guidance
            or "Warning signs detected in your latest check-in. Please monitor your condition and contact your doctor.",
            alert_type="health_check",
            severity="high",
            related_checkin=instance,
        )
