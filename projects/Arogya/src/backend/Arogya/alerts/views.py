from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Alert
from .serializers import (
    AlertDetailSerializer,
    AlertSerializer,
    AlertUpdateSerializer,
)


class AlertViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user alerts.

    Provides CRUD operations and custom actions for alert management:
    - list: Get all alerts for current user
    - retrieve: Get specific alert details
    - create: Create new alert (admin/system only)
    - update: Update alert fields
    - destroy: Delete alert
    - mark_as_read: Mark single or multiple alerts as read
    - acknowledge: Mark alert as acknowledged
    - unread_count: Get count of unread alerts
    """

    permission_classes = [IsAuthenticated]
    filter_backends = [OrderingFilter]
    ordering_fields = ["created_at", "severity"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == "retrieve":
            return AlertDetailSerializer
        elif self.action in ["update", "partial_update"]:
            return AlertUpdateSerializer
        return AlertSerializer

    def get_queryset(self):
        """
        Return alerts for the current user only.
        Supports manual filtering via query parameters.
        """
        user = self.request.user
        queryset = Alert.objects.filter(user=user).select_related(
            "user", "related_checkin"
        )

        # Manual filtering based on query parameters
        alert_type = self.request.query_params.get("alert_type")
        if alert_type:
            queryset = queryset.filter(alert_type=alert_type)

        severity = self.request.query_params.get("severity")
        if severity:
            queryset = queryset.filter(severity=severity)

        is_read = self.request.query_params.get("is_read")
        if is_read:
            is_read_bool = is_read.lower() == "true"
            queryset = queryset.filter(is_read=is_read_bool)

        return queryset

    def perform_create(self, serializer):
        """Set current user when creating alert."""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["post"])
    def mark_as_read(self, request):
        """
        Mark one or multiple alerts as read.

        Expected payload:
        {
            "alert_ids": [1, 2, 3]  # Optional, if not provided marks all
        }
        """
        alert_ids = request.data.get("alert_ids", [])

        if alert_ids:
            # Mark specific alerts as read
            alerts = Alert.objects.filter(user=request.user, id__in=alert_ids)
            count = alerts.update(is_read=True)
            return Response(
                {
                    "status": "success",
                    "message": f"{count} alert(s) marked as read",
                    "count": count,
                },
                status=status.HTTP_200_OK,
            )
        else:
            # Mark all alerts as read
            alerts = Alert.objects.filter(user=request.user)
            count = alerts.update(is_read=True)
            return Response(
                {
                    "status": "success",
                    "message": f"All {count} alert(s) marked as read",
                    "count": count,
                },
                status=status.HTTP_200_OK,
            )

    @action(detail=True, methods=["post"])
    def acknowledge(self, request, pk=None):
        """
        Mark a specific alert as acknowledged.
        Sets the acknowledged_at timestamp.
        """
        alert = self.get_object()

        if alert.user != request.user:
            return Response(
                {"error": "You do not have permission to acknowledge this alert"},
                status=status.HTTP_403_FORBIDDEN,
            )

        alert.acknowledge()
        serializer = self.get_serializer(alert)
        return Response(
            {
                "status": "success",
                "message": "Alert acknowledged",
                "alert": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        """
        Get count of unread alerts for current user.
        Useful for badge notifications in frontend.
        """
        count = Alert.objects.filter(user=request.user, is_read=False).count()
        return Response(
            {"unread_count": count, "user": request.user.id}, status=status.HTTP_200_OK
        )

    @action(detail=False, methods=["get"])
    def critical_alerts(self, request):
        """
        Get only critical severity alerts for current user.
        Useful for emergency notifications.
        """
        alerts = Alert.objects.filter(
            user=request.user, severity="critical", is_read=False
        )
        serializer = self.get_serializer(alerts, many=True)
        return Response(
            {"count": alerts.count(), "critical_alerts": serializer.data},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"])
    def mark_all_as_read(self, request):
        """Mark all alerts as read for current user."""
        alerts = Alert.objects.filter(user=request.user, is_read=False)
        count = alerts.update(is_read=True)
        return Response(
            {
                "status": "success",
                "message": f"{count} alert(s) marked as read",
                "count": count,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"])
    def clear_all(self, request):
        """
        Delete all alerts for current user (with confirmation).
        Only works if 'confirm=true' is passed.
        """
        confirm = request.data.get("confirm", False)

        if not confirm:
            return Response(
                {"error": "Pass confirm=true to clear all alerts"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        alerts = Alert.objects.filter(user=request.user)
        count = alerts.count()
        alerts.delete()

        return Response(
            {
                "status": "success",
                "message": f"{count} alert(s) deleted",
                "count": count,
            },
            status=status.HTTP_200_OK,
        )
