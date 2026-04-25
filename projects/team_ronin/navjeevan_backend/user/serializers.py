import re
import string
import random

from rest_framework import serializers
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError

from .models import NormalUser, MedicalPersonnel, generate_login_id


# ---------------------------------------------------------------------------
# Password validation
# ---------------------------------------------------------------------------

class PasswordValidator:
    """
    Enforces strong password rules:
      - At least 8 characters
      - At least one uppercase letter  (A-Z)
      - At least one lowercase letter  (a-z)
      - At least one digit             (0-9)
      - At least one special character (!@#$%^&*(),.?":{}|<>)
    """
    SPECIAL = r'[!@#$%^&*(),.?":{}|<>]'

    @classmethod
    def validate(cls, password: str):
        errors = []
        if len(password) < 8:
            errors.append("Must be at least 8 characters long.")
        if not re.search(r'[A-Z]', password):
            errors.append("Must contain at least one uppercase letter (A-Z).")
        if not re.search(r'[a-z]', password):
            errors.append("Must contain at least one lowercase letter (a-z).")
        if not re.search(r'\d', password):
            errors.append("Must contain at least one digit (0-9).")
        if not re.search(cls.SPECIAL, password):
            errors.append('Must contain at least one special character (!@#$%^&*(),.?":{}|<>).')
        if errors:
            raise serializers.ValidationError(errors)


# ---------------------------------------------------------------------------
# Email validation helper
# ---------------------------------------------------------------------------

def validate_email_address(email: str) -> str:
    """
    Run Django's built-in RFC-compliant email validator and also
    reject obviously disposable / no-TLD addresses.
    Returns the lowercased, stripped email on success.
    """
    email = email.strip().lower()

    # Django RFC validator
    try:
        validate_email(email)
    except DjangoValidationError:
        raise serializers.ValidationError("Enter a valid email address.")

    # Must have a dot in the domain part  (catches "user@localhost")
    domain = email.split('@')[1]
    if '.' not in domain:
        raise serializers.ValidationError(
            "Email domain must contain at least one dot (e.g. example.com)."
        )

    # Block obviously fake TLDs (single-char after last dot)
    tld = domain.rsplit('.', 1)[-1]
    if len(tld) < 2:
        raise serializers.ValidationError("Email has an invalid top-level domain.")

    return email


# ---------------------------------------------------------------------------
# Step 1 — Initial registration  (no password yet)
# ---------------------------------------------------------------------------

class NormalUserRegisterSerializer(serializers.ModelSerializer):
    """
    Accepts the user's basic info.
    Creates the account (is_verified=False, unusable password),
    generates login_id from name+uuid, and emails the login_id.
    """
    email = serializers.EmailField()

    class Meta:
        model  = NormalUser
        fields = [
            'name', 'email', 'phone_number',
            'date_of_birth', 'special_conditions', 'region',
        ]
        extra_kwargs = {
            'date_of_birth':      {'required': False},
            'special_conditions': {'required': False},
            'region':             {'required': False},
        }

    def validate_email(self, value: str) -> str:
        value = validate_email_address(value)
        if NormalUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate_name(self, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters.")
        if not re.match(r"^[A-Za-z\s'-]+$", value):
            raise serializers.ValidationError(
                "Name may only contain letters, spaces, hyphens, and apostrophes."
            )
        return value

    def to_internal_value(self, data):
        incoming = data.copy()
        # Accept legacy region_id key
        if 'region_id' in incoming and 'region' not in incoming:
            incoming['region'] = incoming.pop('region_id')
        return super().to_internal_value(incoming)

    def create(self, validated_data):
        # Build uuid first so we can derive login_id from it
        user_uuid = validated_data.pop('uuid', None)
        import uuid as _uuid
        if user_uuid is None:
            user_uuid = _uuid.uuid4()

        login_id = generate_login_id(validated_data['name'], user_uuid)

        user = NormalUser(
            uuid=user_uuid,
            login_id=login_id,
            **validated_data,
        )
        # No password yet — set unusable so the account can't be logged into
        user.set_unusable_password()
        user.is_verified = False
        user.save()
        return user


# ---------------------------------------------------------------------------
# Step 2 — Account activation
# ---------------------------------------------------------------------------

class AccountActivationSerializer(serializers.Serializer):
    """
    Accepts login_id + password + confirm_password.
    Validates that:
      - login_id belongs to an existing, unverified NormalUser
      - password meets all strength rules
      - passwords match
    Sets the password and marks the account verified.
    """
    login_id         = serializers.CharField(max_length=20)
    password         = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate_login_id(self, value: str) -> str:
        value = value.strip().upper()
        try:
            user = NormalUser.objects.get(login_id=value)
        except NormalUser.DoesNotExist:
            raise serializers.ValidationError("No account found with this Login ID.")
        if user.is_verified:
            raise serializers.ValidationError(
                "This account is already activated. Please log in."
            )
        if user.status == 'inactive':
            raise serializers.ValidationError("This account has been deactivated.")
        return value

    def validate(self, data):
        password         = data.get('password')
        confirm_password = data.get('confirm_password')

        if password != confirm_password:
            raise serializers.ValidationError(
                {'confirm_password': 'Passwords do not match.'}
            )
        PasswordValidator.validate(password)
        return data

    def activate(self) -> NormalUser:
        """Call after is_valid(). Sets password, marks verified, returns user."""
        login_id = self.validated_data['login_id']
        password = self.validated_data['password']

        user = NormalUser.objects.get(login_id=login_id)
        user.set_password(password)
        user.is_verified = True
        user.save()
        return user


# ---------------------------------------------------------------------------
# Profile serializers
# ---------------------------------------------------------------------------

class NormalUserSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()

    class Meta:
        model  = NormalUser
        fields = [
            'uuid', 'login_id', 'name', 'email', 'phone_number',
            'date_of_birth', 'age', 'special_conditions', 'region',
            'status', 'is_verified', 'date_joined',
        ]
        read_only_fields = ['uuid', 'login_id', 'is_verified', 'date_joined']

    def get_age(self, obj):
        return obj.age


class MedicalPersonnelSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MedicalPersonnel
        fields = [
            'uuid', 'login_id', 'name', 'email', 'phone_number',
            'status', 'is_verified', 'date_joined',
        ]
        read_only_fields = ['uuid', 'login_id', 'is_verified', 'date_joined']


# ---------------------------------------------------------------------------
# Admin: create medical personnel
# ---------------------------------------------------------------------------

class AdminCreateMedicalPersonnelSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()

    class Meta:
        model  = MedicalPersonnel
        fields = ['name', 'email', 'phone_number']

    def validate_email(self, value: str) -> str:
        value = validate_email_address(value)
        if MedicalPersonnel.objects.filter(email=value).exists():
            raise serializers.ValidationError("A medical personnel with this email already exists.")
        return value

    def create(self, validated_data):
        import uuid as _uuid
        user_uuid = _uuid.uuid4()
        login_id  = generate_login_id(validated_data['name'], user_uuid)

        # Generate a strong temporary password
        alphabet = string.ascii_letters + string.digits + '!@#$%^&*()'
        temp_password = ''.join(random.choices(alphabet, k=12))
        # Ensure it passes our own strength rules
        temp_password = (
            random.choice(string.ascii_uppercase)
            + random.choice(string.ascii_lowercase)
            + random.choice(string.digits)
            + random.choice('!@#$%^&*()')
            + ''.join(random.choices(string.ascii_letters + string.digits, k=8))
        )

        user = MedicalPersonnel(
            uuid=user_uuid,
            login_id=login_id,
            is_verified=True,
            status='active',
            **validated_data,
        )
        user.set_password(temp_password)
        user.save()

        # Attach temp_password so the view can include it in the email
        user._temp_password = temp_password
        return user


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

class LoginSerializer(serializers.Serializer):
    login_id = serializers.CharField(max_length=20)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        login_id = data.get('login_id', '').strip().upper()
        password = data.get('password', '')

        # Check both tables
        user = (
            NormalUser.objects.filter(login_id=login_id).first()
            or MedicalPersonnel.objects.filter(login_id=login_id).first()
        )

        if not user or not user.check_password(password):
            raise serializers.ValidationError("Invalid Login ID or password.")

        if user.status == 'inactive':
            raise serializers.ValidationError("This account is inactive.")

        if user.user_type == 'normal' and not user.is_verified:
            raise serializers.ValidationError(
                "Account not activated. Please complete Step 2 using the Login ID sent to your email."
            )

        data['user'] = user
        return data


# ---------------------------------------------------------------------------
# Password change
# ---------------------------------------------------------------------------

class PasswordChangeSerializer(serializers.Serializer):
    old_password         = serializers.CharField(write_only=True)
    new_password         = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True, min_length=8)

    def validate(self, data):
        user = self.context['request'].user

        if not user.check_password(data['old_password']):
            raise serializers.ValidationError({'old_password': 'Current password is incorrect.'})

        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError(
                {'new_password_confirm': 'Passwords do not match.'}
            )

        PasswordValidator.validate(data['new_password'])

        if data['old_password'] == data['new_password']:
            raise serializers.ValidationError(
                {'new_password': 'New password must be different from the current password.'}
            )

        return data


# ---------------------------------------------------------------------------
# Profile update
# ---------------------------------------------------------------------------

class ProfileUpdateSerializer(serializers.Serializer):
    name               = serializers.CharField(max_length=255, required=False)
    phone_number       = serializers.CharField(max_length=20,  required=False)
    special_conditions = serializers.CharField(required=False, allow_blank=True)
    region             = serializers.CharField(max_length=255, required=False, allow_blank=True)

    def to_internal_value(self, data):
        incoming = data.copy()
        if 'region_id' in incoming and 'region' not in incoming:
            incoming['region'] = incoming.pop('region_id')
        return super().to_internal_value(incoming)

    def validate_name(self, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters.")
        if not re.match(r"^[A-Za-z\s'-]+$", value):
            raise serializers.ValidationError(
                "Name may only contain letters, spaces, hyphens, and apostrophes."
            )
        return value