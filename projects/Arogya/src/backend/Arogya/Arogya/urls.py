"""
URL configuration for Arogya project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework import routers

# API Root Router
router = routers.DefaultRouter()

urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),
    # API Endpoints
    path("accounts/", include("accounts.urls")),
    path("checkins/", include("checkins.urls")),
    path("doctors/", include("doctors.urls")),
    path("chat/", include("chat.urls")),
    path("alerts/", include("alerts.urls")),
    path("medicines/", include("medicines.urls")),
    path("reports/", include("reports.urls")),
    path("ai/", include("AI.urls")),
    path("appointments/", include("appointments.urls")),
    # API Authentication
    path("api-auth/", include("rest_framework.urls")),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
