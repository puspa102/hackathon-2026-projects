from rest_framework import serializers
from .models import DischargeReport


class DischargeReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = DischargeReport
        fields = ['id', 'user', 'file', 'extracted_text', 'uploaded_at']
        read_only_fields = ['user', 'extracted_text', 'uploaded_at']