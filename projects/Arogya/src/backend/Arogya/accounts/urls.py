from django.urls import path

from .views import (
    DoctorDashboardView,
    DoctorListView,
    LoginView,
    LogoutView,
    PatientDashboardView,
    RegisterView,
    UserProfileView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("profile/", UserProfileView.as_view(), name="profile"),
    path("dashboard/", PatientDashboardView.as_view(), name="dashboard"),
    path("doctor-dashboard/", DoctorDashboardView.as_view(), name="doctor-dashboard"),
    path("doctors/", DoctorListView.as_view(), name="doctor-list"),
]
