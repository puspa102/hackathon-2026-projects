from django.contrib import admin

from .models import DailyCheckIn


@admin.register(DailyCheckIn)
class DailyCheckInAdmin(admin.ModelAdmin):
    """Admin interface for Daily Check-In records."""

    list_display = (
        "id",
        "user",
        "risk_level",
        "pain_level",
        "fever",
        "breathing_problem",
        "bleeding",
        "created_at",
    )
    list_filter = (
        "risk_level",
        "fever",
        "breathing_problem",
        "bleeding",
        "created_at",
    )
    search_fields = (
        "user__username",
        "user__email",
        "symptoms",
    )
    readonly_fields = (
        "risk_level",
        "guidance",
        "created_at",
    )
    ordering = ("-created_at",)
    date_hierarchy = "created_at"

    fieldsets = (
        (
            "Patient Information",
            {
                "fields": ("user", "created_at"),
            },
        ),
        (
            "Symptoms & Vital Signs",
            {
                "fields": (
                    "symptoms",
                    "pain_level",
                    "fever",
                    "breathing_problem",
                    "bleeding",
                ),
            },
        ),
        (
            "Risk Assessment",
            {
                "fields": ("risk_level", "guidance"),
                "classes": ("collapse",),
            },
        ),
    )

    def has_add_permission(self, request):
        """Prevent manual creation of check-ins in admin."""
        return False

    def has_delete_permission(self, request, obj=None):
        """Only superusers can delete check-ins."""
        return request.user.is_superuser
