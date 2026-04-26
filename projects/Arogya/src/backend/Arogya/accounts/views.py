from django.db import models as db_models
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import DoctorProfile, PatientProfile
from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    UpdateProfileSerializer,
    UserSerializer,
)


class RegisterView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response(
                {
                    "message": "Account created successfully",
                    "token": token.key,
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            token, _ = Token.objects.get_or_create(user=user)
            return Response(
                {
                    "message": "Login successful",
                    "token": token.key,
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    def post(self, request):
        try:
            request.user.auth_token.delete()
            return Response(
                {"message": "Successfully logged out"}, status=status.HTTP_200_OK
            )
        except Exception:
            return Response(
                {"error": "Logout failed"}, status=status.HTTP_400_BAD_REQUEST
            )


class UserProfileView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"error": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"error": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        serializer = UpdateProfileSerializer(
            request.user, data=request.data, partial=True
        )
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "message": "Profile updated successfully",
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PatientDashboardView(APIView):
    """
    Single aggregated dashboard endpoint for the patient home screen.
    Returns: next medicine, today's check-in status, latest check-in, recent alerts, doctor message.
    """

    def get(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"error": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        from alerts.models import Alert
        from alerts.serializers import AlertSerializer
        from checkins.models import DailyCheckIn
        from checkins.serializers import DailyCheckInSerializer
        from medicines.models import Medicine
        from medicines.serializers import MedicineSerializer

        today = timezone.now().date()
        now_time = timezone.now().time()

        # Medicines active today
        today_medicines = (
            Medicine.objects.filter(
                user=request.user,
                start_date__lte=today,
            )
            .filter(
                db_models.Q(end_date__isnull=True) | db_models.Q(end_date__gte=today)
            )
            .order_by("reminder_time")
        )

        # Next upcoming medicine by reminder_time
        next_medicine = today_medicines.filter(reminder_time__gte=now_time).first()
        if not next_medicine:
            next_medicine = today_medicines.first()

        # Today's check-in
        today_checkin = (
            DailyCheckIn.objects.filter(user=request.user, created_at__date=today)
            .order_by("-created_at")
            .first()
        )

        # Latest check-in overall
        latest_checkin = (
            DailyCheckIn.objects.filter(user=request.user)
            .order_by("-created_at")
            .first()
        )

        # Recent check-ins (last 5)
        recent_checkins = DailyCheckIn.objects.filter(user=request.user).order_by(
            "-created_at"
        )[:5]

        # Unread alerts count
        unread_count = Alert.objects.filter(user=request.user, is_read=False).count()

        # Recent alerts (last 5)
        recent_alerts = Alert.objects.filter(user=request.user).order_by("-created_at")[
            :5
        ]

        # Latest doctor message alert
        doctor_message = (
            Alert.objects.filter(user=request.user, alert_type="doctor_message")
            .order_by("-created_at")
            .first()
        )

        return Response(
            {
                "today_medicines": MedicineSerializer(today_medicines, many=True).data,
                "next_medicine": MedicineSerializer(next_medicine).data
                if next_medicine
                else None,
                "today_checkin": DailyCheckInSerializer(today_checkin).data
                if today_checkin
                else None,
                "today_checkin_done": today_checkin is not None,
                "latest_checkin": DailyCheckInSerializer(latest_checkin).data
                if latest_checkin
                else None,
                "recent_checkins": DailyCheckInSerializer(
                    recent_checkins, many=True
                ).data,
                "unread_alerts_count": unread_count,
                "recent_alerts": AlertSerializer(recent_alerts, many=True).data,
                "doctor_message": AlertSerializer(doctor_message).data
                if doctor_message
                else None,
                "medicines_count": today_medicines.count(),
            },
            status=status.HTTP_200_OK,
        )
