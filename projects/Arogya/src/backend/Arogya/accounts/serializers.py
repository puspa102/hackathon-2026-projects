from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import DoctorProfile, PatientProfile, User


class PatientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = [
            "blood_group",
            "emergency_contact_name",
            "emergency_contact_phone",
            "allergies",
            "medical_conditions",
        ]


class DoctorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorProfile
        fields = [
            "specialization",
            "license_number",
            "hospital",
            "experience_years",
            "bio",
            "consultation_fee",
        ]


class UserSerializer(serializers.ModelSerializer):
    patient_profile = PatientProfileSerializer(read_only=True)
    doctor_profile = DoctorProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "role",
            "gender",
            "date_of_birth",
            "address",
            "patient_profile",
            "doctor_profile",
        ]
        read_only_fields = ["id", "role"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["username", "email", "password", "first_name", "role"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            role=validated_data.get("role", "patient"),
        )
        # Auto-create the appropriate profile
        if user.role == "doctor":
            DoctorProfile.objects.create(user=user)
        else:
            PatientProfile.objects.create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        username = data.get("username", "").strip()
        password = data.get("password", "")

        if not username:
            raise serializers.ValidationError({"detail": "Username is required."})
        if not password:
            raise serializers.ValidationError({"detail": "Password is required."})

        user = authenticate(username=username, password=password)

        if user is None:
            try:
                user_obj = User.objects.get(email=username)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None

        if user is None:
            raise serializers.ValidationError(
                {"detail": "Invalid username or password. Please try again."}
            )
        if not user.is_active:
            raise serializers.ValidationError(
                {"detail": "This account has been disabled. Please contact support."}
            )

        # Ensure profile exists
        if user.role == "doctor":
            DoctorProfile.objects.get_or_create(user=user)
        else:
            PatientProfile.objects.get_or_create(user=user)

        data["user"] = user
        return data


class UpdateProfileSerializer(serializers.ModelSerializer):
    """Used for PATCH /accounts/profile/ — updates user + nested profile"""

    patient_profile = PatientProfileSerializer(required=False)
    doctor_profile = DoctorProfileSerializer(required=False)

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "phone",
            "gender",
            "date_of_birth",
            "address",
            "patient_profile",
            "doctor_profile",
        ]

    def update(self, instance, validated_data):
        patient_data = validated_data.pop("patient_profile", None)
        doctor_data = validated_data.pop("doctor_profile", None)

        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update patient profile
        if patient_data is not None:
            profile, _ = PatientProfile.objects.get_or_create(user=instance)
            for attr, value in patient_data.items():
                setattr(profile, attr, value)
            profile.save()

        # Update doctor profile
        if doctor_data is not None:
            profile, _ = DoctorProfile.objects.get_or_create(user=instance)
            for attr, value in doctor_data.items():
                setattr(profile, attr, value)
            profile.save()

        return instance
