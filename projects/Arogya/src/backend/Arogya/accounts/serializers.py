from django.contrib.auth.models import User
from rest_framework import serializers

from .models import AccountProfile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(
        choices=AccountProfile.Role.choices,
        write_only=True,
        default=AccountProfile.Role.PATIENT,
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role']

    def create(self, validated_data):
        role = validated_data.pop('role', AccountProfile.Role.PATIENT)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password']
        )
        AccountProfile.objects.create(user=user, role=role)
        return user


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']

    def get_role(self, obj):
        profile = getattr(obj, 'account_profile', None)
        if profile is None:
            return AccountProfile.Role.PATIENT
        return profile.role
