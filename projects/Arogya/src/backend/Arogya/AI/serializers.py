# AI/serializers.py
# Request validation serializers for all 3 AI endpoints

from rest_framework import serializers


# ══════════════════════════════════════════════════════════════════════════════
# Serializer 1 — Symptom Analysis
# ══════════════════════════════════════════════════════════════════════════════

class SymptomAnalysisSerializer(serializers.Serializer):
    BREATHING_CHOICES = ["none", "mild", "severe"]

    fever           = serializers.IntegerField(min_value=0, max_value=10, default=0, required=False, allow_null=True)
    pain_level      = serializers.IntegerField(min_value=0, max_value=10, default=0, required=False, allow_null=True)
    breathing       = serializers.ChoiceField(choices=BREATHING_CHOICES, default="none", required=False, allow_null=True)
    other_symptoms  = serializers.ListField(
                        child=serializers.CharField(max_length=100),
                        required=False,
                        default=list,
                        allow_null=True
                      )
    notes           = serializers.CharField(
                        required=False,
                        allow_blank=True,
                        allow_null=True,
                        default="",
                        max_length=1000
                      )
    diagnosis       = serializers.CharField(required=False, default="unknown", max_length=300, allow_null=True)
    medicines       = serializers.ListField(
                        child=serializers.CharField(max_length=200),
                        required=False,
                        default=list,
                        allow_null=True
                      )


# ══════════════════════════════════════════════════════════════════════════════
# Serializer 2 — Report Extraction (file upload — validated in view)
# ══════════════════════════════════════════════════════════════════════════════

class ReportUploadSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate_file(self, value):
        allowed_types = [
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
        ]
        if value.content_type not in allowed_types:
            raise serializers.ValidationError(
                f"Unsupported file type: {value.content_type}. "
                "Allowed: PDF, JPEG, PNG, WEBP."
            )
        max_size = 10 * 1024 * 1024  # 10 MB
        if value.size > max_size:
            raise serializers.ValidationError("File too large. Maximum allowed size is 10MB.")
        return value


# ══════════════════════════════════════════════════════════════════════════════
# Serializer 3 — Recovery Chat
# ══════════════════════════════════════════════════════════════════════════════

class ChatMessageSerializer(serializers.Serializer):
    role  = serializers.ChoiceField(choices=["user", "model"])
    parts = serializers.ListField(
                child=serializers.CharField(max_length=2000),
                min_length=1
            )


class MedicineContextSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)


class PatientContextSerializer(serializers.Serializer):
    patient_name    = serializers.CharField(required=False, default="Patient", max_length=200)
    diagnosis       = serializers.CharField(required=False, default="unknown", max_length=300)
    discharge_date  = serializers.CharField(required=False, allow_blank=True, default="")
    followup_date   = serializers.CharField(required=False, allow_blank=True, default="")
    medicines       = MedicineContextSerializer(many=True, required=False, default=list)


class RecoveryChatSerializer(serializers.Serializer):
    messages        = ChatMessageSerializer(many=True, min_length=1, required=False)
    message         = serializers.CharField(required=False)
    patient_context = PatientContextSerializer(required=False)

    def validate_messages(self, messages):
        if messages[-1]["role"] != "user":
            raise serializers.ValidationError("The last message must have role 'user'.")
        return messages