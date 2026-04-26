from rest_framework import serializers

from .models import Alert


class AlertSerializer(serializers.ModelSerializer):
    """
    Serializer for alert notifications.
    Alerts are generated from check-in risk assessments and other health events.
    """

    alert_type_display = serializers.CharField(
        source="get_alert_type_display", read_only=True
    )
    severity_display = serializers.CharField(
        source="get_severity_display", read_only=True
    )

    class Meta:
        model = Alert
        fields = [
            "id",
            "user",
            "title",
            "message",
            "alert_type",
            "alert_type_display",
            "severity",
            "severity_display",
            "related_checkin",
            "is_read",
            "created_at",
            "acknowledged_at",
        ]
        read_only_fields = ["id", "user", "created_at"]


class AlertDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for individual alert view with full context.
    """

    alert_type_display = serializers.CharField(
        source="get_alert_type_display", read_only=True
    )
    severity_display = serializers.CharField(
        source="get_severity_display", read_only=True
    )
    user_username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Alert
        fields = [
            "id",
            "user",
            "user_username",
            "title",
            "message",
            "alert_type",
            "alert_type_display",
            "severity",
            "severity_display",
            "related_checkin",
            "is_read",
            "created_at",
            "acknowledged_at",
        ]
        read_only_fields = ["id", "user", "user_username", "created_at"]


class AlertUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating alert status (read/acknowledged).
    """

    class Meta:
        model = Alert
        fields = ["is_read", "acknowledged_at"]
