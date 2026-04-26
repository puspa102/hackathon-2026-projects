from django.contrib import admin

from .models import Alert


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    """Admin interface for Alert management."""

    list_display = (
        "id",
        "title",
        "user",
        "severity",
        "alert_type",
        "is_read",
        "created_at",
    )
    list_filter = (
        "severity",
        "alert_type",
        "is_read",
        "created_at",
        "acknowledged_at",
    )
    search_fields = (
        "title",
        "message",
        "user__username",
        "user__email",
    )
    readonly_fields = (
        "created_at",
        "id",
    )
    ordering = ("-created_at",)
    date_hierarchy = "created_at"

    fieldsets = (
        (
            "Alert Information",
            {
                "fields": ("id", "title", "message", "user"),
            },
        ),
        (
            "Classification",
            {
                "fields": ("alert_type", "severity"),
            },
        ),
        (
            "Status",
            {
                "fields": ("is_read", "acknowledged_at"),
            },
        ),
        (
            "Related Data",
            {
                "fields": ("related_checkin",),
            },
        ),
        (
            "Timestamps",
            {
                "fields": ("created_at",),
                "classes": ("collapse",),
            },
        ),
    )

    def get_readonly_fields(self, request, obj=None):
        """Make all fields readonly if viewing an existing alert."""
        if obj:
            return self.readonly_fields + (
                "title",
                "message",
                "user",
                "alert_type",
                "severity",
                "related_checkin",
            )
        return self.readonly_fields

    actions = ["mark_as_read", "mark_as_unread"]

    def mark_as_read(self, request, queryset):
        """Admin action to mark selected alerts as read."""
        updated = queryset.update(is_read=True)
        self.message_user(request, f"{updated} alert(s) marked as read.")

    mark_as_read.short_description = "Mark selected alerts as read"

    def mark_as_unread(self, request, queryset):
        """Admin action to mark selected alerts as unread."""
        updated = queryset.update(is_read=False)
        self.message_user(request, f"{updated} alert(s) marked as unread.")

    mark_as_unread.short_description = "Mark selected alerts as unread"
