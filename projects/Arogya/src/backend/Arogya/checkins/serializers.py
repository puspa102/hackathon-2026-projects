from rest_framework import serializers

from .models import DailyCheckIn


class DailyCheckInSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyCheckIn
        fields = ["id", "user", "mood", "notes", "temperature", "created_at"]
        read_only_fields = ["id", "user", "created_at"]
