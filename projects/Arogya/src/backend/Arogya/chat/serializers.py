from rest_framework import serializers

from .models import ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    def get_sender_name(self, obj):
        name = f"{obj.sender.first_name} {obj.sender.last_name}".strip()
        return name or obj.sender.username

    def get_doctor_name(self, obj):
        if not obj.doctor:
            return None
        name = f"{obj.doctor.first_name} {obj.doctor.last_name}".strip()
        return name or obj.doctor.username

    class Meta:
        model = ChatMessage
        fields = [
            "id",
            "sender",
            "sender_name",
            "doctor",
            "doctor_name",
            "message",
            "is_from_doctor",
            "created_at",
        ]
        read_only_fields = [
            "sender",
            "sender_name",
            "doctor_name",
            "is_from_doctor",
            "created_at",
        ]
