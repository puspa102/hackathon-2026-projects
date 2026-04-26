from rest_framework import serializers

from .models import Alert


class AlertSerializer(serializers.ModelSerializer):
    severity_display = serializers.CharField(
        source="get_severity_display", read_only=True
    )
    alert_type_display = serializers.CharField(
        source="get_alert_type_display", read_only=True
    )

    class Meta:
        model = Alert
        fields = [
            "id",
            "title",
            "message",
            "alert_type",
            "alert_type_display",
            "severity",
            "severity_display",
            "is_read",
            "created_at",
            "acknowledged_at",
        ]
        read_only_fields = ["id", "created_at"]


class AlertDetailSerializer(AlertSerializer):
    class Meta(AlertSerializer.Meta):
        fields = AlertSerializer.Meta.fields + ["related_checkin"]


class AlertUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = ["is_read", "acknowledged_at"]
