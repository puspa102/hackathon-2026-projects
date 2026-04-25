import logging

from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail, BadHeaderError
from django.conf import settings
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

logger = logging.getLogger(__name__)

from .models import NormalUser, MedicalPersonnel
from .serializers import (
    NormalUserRegisterSerializer,
    AccountActivationSerializer,
    NormalUserSerializer,
    MedicalPersonnelSerializer,
    AdminCreateMedicalPersonnelSerializer,
    LoginSerializer,
    PasswordChangeSerializer,
    ProfileUpdateSerializer,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _jwt_tokens(user) -> dict:
    refresh = RefreshToken.for_user(user)
    return {'refresh': str(refresh), 'access': str(refresh.access_token)}


def _profile_serializer(user):
    if isinstance(user, NormalUser):
        return NormalUserSerializer(user)
    return MedicalPersonnelSerializer(user)


def _send_login_id_email(user: NormalUser) -> None:
    """
    Email the generated login_id to the user after Step 1 registration.
    The user needs this login_id to complete Step 2 activation.

    Raises:
        BadHeaderError  — if the email/name contains header-injection characters.
        smtplib.SMTPException — on any SMTP transport failure.
    Both are logged and re-raised so the view can return a 502 instead of 201.
    """
    subject = "Your Navjeevan Login ID — Complete Your Registration"
    message = (
        f"Hello {user.name},\n\n"
        f"Thank you for registering with Navjeevan.\n\n"
        f"Your Login ID is:\n\n"
        f"    {user.login_id}\n\n"
        f"To activate your account, go to the activation page and enter:\n"
        f"  - Your Login ID (above)\n"
        f"  - A new password of your choice\n\n"
        f"Password requirements:\n"
        f"  - At least 8 characters\n"
        f"  - At least one uppercase letter  (A-Z)\n"
        f"  - At least one lowercase letter  (a-z)\n"
        f"  - At least one digit             (0-9)\n"
        f"  - At least one special character (!@#$%^&*(),.?\":{{}}|<>)\n\n"
        f"If you did not register for a Navjeevan account, ignore this email.\n\n"
        f"-- The Navjeevan Team"
    )
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
    except BadHeaderError:
        logger.error("BadHeaderError sending login_id email to %s", user.email)
        raise
    except Exception as exc:
        logger.error(
            "Failed to send login_id email to %s: %s",
            user.email, exc, exc_info=True
        )
        raise


# ---------------------------------------------------------------------------
# Normal User ViewSet
# ---------------------------------------------------------------------------

class NormalUserViewSet(GenericViewSet):
    """
    Step 1  POST /user/register/   — submit basic info, receive login_id by email
    Step 2  POST /user/activate/   — submit login_id + password → account live
            POST /user/login/      — login with login_id + password
            GET  /user/profile/
            PATCH /user/update-profile/
            POST /user/change-password/
            POST /user/deactivate/
    """
    queryset         = NormalUser.objects.all()
    # Fallback used by drf_yasg during schema generation and generic introspection.
    serializer_class = NormalUserSerializer

    # Maps each action to its serializer class.
    _serializer_map = {
        'register':        NormalUserRegisterSerializer,
        'activate':        AccountActivationSerializer,
        'login':           LoginSerializer,
        'profile':         NormalUserSerializer,
        'update_profile':  ProfileUpdateSerializer,
        'change_password': PasswordChangeSerializer,
    }

    def get_serializer_class(self):
        # drf_yasg calls this during schema generation before self.action is set.
        # The swagger_fake_view guard lets it fall back to serializer_class safely.
        if getattr(self, 'swagger_fake_view', False):
            return NormalUserSerializer
        return self._serializer_map.get(self.action, NormalUserSerializer)

    def get_permissions(self):
        public = {'register', 'activate', 'login'}
        if self.action in public:
            return [AllowAny()]
        return [IsAuthenticated()]

    # ── Step 1: Register ────────────────────────────────────────────────────
    @swagger_auto_schema(
        operation_summary="Step 1 — Register",
        operation_description=(
            "Submit basic info. Account is created (unverified, no password set). "
            "A Login ID is generated and emailed to the provided address."
        ),
        request_body=NormalUserRegisterSerializer,
        responses={
            201: openapi.Response("Registration successful — Login ID emailed", NormalUserSerializer),
            400: "Validation error",
            502: "Email delivery failed",
        },
        tags=["User — Registration"],
    )
    @action(detail=False, methods=['post'])
    def register(self, request):
        """
        Submit: name, email, phone_number, [date_of_birth, special_conditions, region]
        Creates account (unverified, no password).
        Emails the generated login_id to the provided email address.
        """
        serializer = NormalUserRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        try:
            _send_login_id_email(user)
        except Exception:
            # Account was created — delete it so the user can retry cleanly
            # rather than being stuck with an unverified account they can't
            # receive the login_id for.
            user.delete()
            return Response(
                {
                    'error': (
                        'Registration failed: we could not send your Login ID email. '
                        'Please check your email address and try again.'
                    )
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(
            {
                'message': (
                    'Registration successful. Your Login ID has been sent to '
                    f'{user.email}. Please use it to activate your account.'
                ),
                # Only expose login_id in the response during development
                'login_id': user.login_id if settings.DEBUG else None,
            },
            status=status.HTTP_201_CREATED,
        )

    # ── Step 2: Activate ────────────────────────────────────────────────────
    @swagger_auto_schema(
        operation_summary="Step 2 — Activate account",
        operation_description=(
            "Submit the Login ID received by email plus a new password. "
            "Sets the password, marks the account verified, and returns JWT tokens."
        ),
        request_body=AccountActivationSerializer,
        responses={
            200: openapi.Response("Account activated — JWT tokens returned", NormalUserSerializer),
            400: "Validation error (bad login_id, password mismatch, weak password)",
        },
        tags=["User — Registration"],
    )
    @action(detail=False, methods=['post'])
    def activate(self, request):
        """
        Submit: login_id, password, confirm_password
        Validates login_id + password strength, sets password, marks account verified.
        Returns JWT tokens so the frontend can redirect straight into the app.
        """
        serializer = AccountActivationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.activate()

        return Response(
            {
                'message': 'Account activated successfully. Welcome to Navjeevan!',
                'user':    NormalUserSerializer(user).data,
                'tokens':  _jwt_tokens(user),
            },
            status=status.HTTP_200_OK,
        )

    # ── Login ───────────────────────────────────────────────────────────────
    @swagger_auto_schema(
        operation_summary="Login",
        operation_description="Authenticate with login_id and password. Works for both Normal Users and Medical Personnel.",
        request_body=LoginSerializer,
        responses={
            200: openapi.Response("Login successful — JWT tokens returned", NormalUserSerializer),
            400: "Invalid credentials or unverified account",
        },
        tags=["User — Auth"],
    )
    @action(detail=False, methods=['post'])
    def login(self, request):
        """
        Submit: login_id, password
        Works for both NormalUser and MedicalPersonnel.
        """
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        user.update_last_login()

        return Response(
            {
                'message': 'Login successful.',
                'user':    _profile_serializer(user).data,
                'tokens':  _jwt_tokens(user),
            },
            status=status.HTTP_200_OK,
        )

    # ── Profile ─────────────────────────────────────────────────────────────
    @swagger_auto_schema(
        operation_summary="Get profile",
        operation_description="Returns the authenticated user's profile.",
        responses={200: NormalUserSerializer},
        tags=["User — Profile"],
    )
    @action(detail=False, methods=['get'])
    def profile(self, request):
        return Response(_profile_serializer(request.user).data)

    # ── Update Profile ───────────────────────────────────────────────────────
    @swagger_auto_schema(
        operation_summary="Update profile",
        operation_description="Update name, phone_number, special_conditions, or region.",
        request_body=ProfileUpdateSerializer,
        responses={200: NormalUserSerializer},
        tags=["User — Profile"],
    )
    @action(detail=False, methods=['patch'])
    def update_profile(self, request):
        serializer = ProfileUpdateSerializer(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        user = request.user
        NORMAL_ONLY = {'special_conditions', 'region'}

        for field, value in serializer.validated_data.items():
            if field in NORMAL_ONLY and not isinstance(user, NormalUser):
                continue
            setattr(user, field, value)

        user.save()
        return Response(
            {
                'message': 'Profile updated successfully.',
                'user':    _profile_serializer(user).data,
            }
        )

    # ── Change Password ──────────────────────────────────────────────────────
    @swagger_auto_schema(
        operation_summary="Change password",
        operation_description="Provide old password and a new password that meets strength requirements.",
        request_body=PasswordChangeSerializer,
        responses={
            200: openapi.Response("Password changed successfully"),
            400: "Validation error",
        },
        tags=["User — Profile"],
    )
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'message': 'Password changed successfully.'})

    # ── Deactivate ───────────────────────────────────────────────────────────
    @swagger_auto_schema(
        operation_summary="Deactivate account",
        operation_description="Soft-deletes the account by marking it inactive. Cannot be undone via the API.",
        responses={200: openapi.Response("Account deactivated successfully")},
        tags=["User — Profile"],
    )
    @action(detail=False, methods=['post'])
    def deactivate_account(self, request):
        request.user.status = 'inactive'
        request.user.save()
        return Response({'message': 'Account deactivated successfully.'})


# ---------------------------------------------------------------------------
# Medical Personnel ViewSet  (superadmin only)
# ---------------------------------------------------------------------------

class MedicalPersonnelViewSet(GenericViewSet):
    """
    All actions require the caller to be a superuser.
    POST  /medical/create/
    GET   /medical/list/
    GET   /medical/retrieve/?uuid=<uuid>
    PATCH /medical/update/?uuid=<uuid>
    """
    queryset           = MedicalPersonnel.objects.all()
    serializer_class   = MedicalPersonnelSerializer
    permission_classes = [IsAuthenticated]

    def _check_superuser(self, request):
        if not request.user.is_superuser:
            return Response(
                {'error': 'Only superusers can perform this action.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        return None

    # ── Create ───────────────────────────────────────────────────────────────
    @swagger_auto_schema(
        operation_summary="Create medical personnel",
        operation_description="Superadmin only. Creates a medical personnel account with auto-generated credentials.",
        request_body=AdminCreateMedicalPersonnelSerializer,
        responses={
            201: openapi.Response("Medical personnel created", MedicalPersonnelSerializer),
            400: "Validation error",
            403: "Not a superuser",
        },
        tags=["Medical Personnel"],
    )
    @action(detail=False, methods=['post'])
    def create_personnel(self, request):
        if err := self._check_superuser(request):
            return err

        serializer = AdminCreateMedicalPersonnelSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # TODO: email user._temp_password to user.email via Django email backend
        return Response(
            {
                'message':  'Medical personnel created successfully.',
                'user':     MedicalPersonnelSerializer(user).data,
                'login_id': user.login_id,
                'note':     'Temporary credentials have been sent to the provided email.',
            },
            status=status.HTTP_201_CREATED,
        )

    # ── List ─────────────────────────────────────────────────────────────────
    @swagger_auto_schema(
        operation_summary="List medical personnel",
        operation_description="Superadmin only. Returns all medical personnel records.",
        responses={
            200: MedicalPersonnelSerializer(many=True),
            403: "Not a superuser",
        },
        tags=["Medical Personnel"],
    )
    @action(detail=False, methods=['get'])
    def list_personnel(self, request):
        if err := self._check_superuser(request):
            return err
        serializer = MedicalPersonnelSerializer(self.get_queryset(), many=True)
        return Response(serializer.data)

    # ── Retrieve ─────────────────────────────────────────────────────────────
    @swagger_auto_schema(
        operation_summary="Retrieve medical personnel",
        operation_description="Superadmin only. Retrieve a single medical personnel record by UUID.",
        manual_parameters=[
            openapi.Parameter(
                'uuid', openapi.IN_QUERY,
                description="UUID of the medical personnel record",
                type=openapi.TYPE_STRING, required=True,
            )
        ],
        responses={
            200: MedicalPersonnelSerializer,
            400: "uuid param missing",
            403: "Not a superuser",
            404: "Not found",
        },
        tags=["Medical Personnel"],
    )
    @action(detail=False, methods=['get'])
    def retrieve_personnel(self, request):
        if err := self._check_superuser(request):
            return err

        personnel_uuid = request.query_params.get('uuid')
        if not personnel_uuid:
            return Response(
                {'error': 'uuid query parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        personnel = get_object_or_404(MedicalPersonnel, uuid=personnel_uuid)
        return Response(MedicalPersonnelSerializer(personnel).data)

    # ── Update ───────────────────────────────────────────────────────────────
    @swagger_auto_schema(
        operation_summary="Update medical personnel",
        operation_description="Superadmin only. Update name, phone_number, or status of a medical personnel record.",
        manual_parameters=[
            openapi.Parameter(
                'uuid', openapi.IN_QUERY,
                description="UUID of the medical personnel record",
                type=openapi.TYPE_STRING, required=True,
            )
        ],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'name':         openapi.Schema(type=openapi.TYPE_STRING),
                'phone_number': openapi.Schema(type=openapi.TYPE_STRING),
                'status':       openapi.Schema(type=openapi.TYPE_STRING, enum=['active', 'inactive']),
            },
        ),
        responses={
            200: MedicalPersonnelSerializer,
            400: "uuid param missing",
            403: "Not a superuser",
            404: "Not found",
        },
        tags=["Medical Personnel"],
    )
    @action(detail=False, methods=['patch'])
    def update_personnel(self, request):
        if err := self._check_superuser(request):
            return err

        personnel_uuid = request.query_params.get('uuid')
        if not personnel_uuid:
            return Response(
                {'error': 'uuid query parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        personnel = get_object_or_404(MedicalPersonnel, uuid=personnel_uuid)
        for field in {'name', 'phone_number', 'status'}.intersection(request.data):
            setattr(personnel, field, request.data[field])
        personnel.save()

        return Response(
            {
                'message': 'Medical personnel updated successfully.',
                'user':    MedicalPersonnelSerializer(personnel).data,
            }
        )